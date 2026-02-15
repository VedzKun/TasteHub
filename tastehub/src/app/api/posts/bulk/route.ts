import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import type { Platform } from '@/types';

type PostStatus = 'draft' | 'scheduled' | 'published';

interface BulkPostItem {
  date: string;
  theme: string;
  platform: Platform;
  postIdea: string;
  captionDraft: string;
  cta: string;
  hashtags: string[] | string;
  recommendedTime: string;
}

interface BulkRequestBody {
  items?: BulkPostItem[];
  defaultStatus?: PostStatus;
  createCalendarEvents?: boolean;
}

const ALLOWED_PLATFORMS: Platform[] = ['instagram', 'facebook', 'twitter'];

function normalizeHashtags(value: string[] | string) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function isISODate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as BulkRequestBody;
    const items = body.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }
    if (items.length > 90) {
      return NextResponse.json({ error: 'Cannot save more than 90 items at once' }, { status: 400 });
    }

    const defaultStatus: PostStatus = body.defaultStatus ?? 'scheduled';
    const createCalendarEvents = body.createCalendarEvents ?? true;

    const sanitized = items.map((item, index) => {
      const platform = String(item.platform || '').toLowerCase() as Platform;
      const date = String(item.date || '');
      if (!ALLOWED_PLATFORMS.includes(platform)) {
        throw new Error(`Invalid platform at item ${index + 1}`);
      }
      if (!isISODate(date)) {
        throw new Error(`Invalid date at item ${index + 1}`);
      }

      const hashtags = normalizeHashtags(item.hashtags);
      const hashtagLine = hashtags.length > 0 ? `\n\n${hashtags.join(' ')}` : '';
      const description = `${item.captionDraft}\n\nIdea: ${item.postIdea}\nCTA: ${item.cta}${hashtagLine}`;

      return {
        title: item.theme,
        description,
        platform,
        date,
        time: item.recommendedTime || null,
      };
    });

    const createdPosts = await prisma.$transaction(
      sanitized.map((item) =>
        prisma.post.create({
          data: {
            userId: session.user.id,
            title: item.title,
            description: item.description,
            platform: item.platform,
            date: item.date,
            status: defaultStatus,
          },
          select: { id: true, title: true, platform: true, date: true },
        })
      )
    );

    let createdEvents = 0;
    if (createCalendarEvents) {
      await prisma.$transaction(
        sanitized.map((item) =>
          prisma.calendarEvent.create({
            data: {
              userId: session.user.id,
              title: `${item.title} (${item.platform})`,
              description: `Generated from 30-day planner`,
              date: item.date,
              time: item.time,
              type: 'campaign',
              color:
                item.platform === 'instagram'
                  ? '#E4405F'
                  : item.platform === 'facebook'
                    ? '#1877F2'
                    : '#1DA1F2',
            },
          })
        )
      );
      createdEvents = sanitized.length;
    }

    return NextResponse.json({
      message: 'Generated plan saved successfully',
      createdPosts: createdPosts.length,
      createdEvents,
      posts: createdPosts,
    });
  } catch (error) {
    console.error('POST /api/posts/bulk error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save generated posts' },
      { status: 400 }
    );
  }
}
