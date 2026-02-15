import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateCalendarDraft } from '@/lib/calendarGenerator';
import { buildModelFeaturesFromPost, predictEngagementRateBatch } from '@/lib/mlPredictor';
import type { Platform } from '@/types';

interface GenerateRequestBody {
  companyName?: string;
  objective?: string;
  platforms?: string[];
  days?: number;
  followerCount?: number;
  requirements?: {
    dailyThemes?: boolean;
    platformSpecific?: boolean;
    analytics?: boolean;
  };
}

const ALLOWED_PLATFORMS: Platform[] = ['instagram', 'facebook', 'twitter'];

function normalizePlatforms(platforms: string[] | undefined) {
  const normalized =
    platforms
      ?.map((platform) => platform.toLowerCase())
      .filter((platform): platform is Platform =>
        ALLOWED_PLATFORMS.includes(platform as Platform)
      ) ?? [];

  return normalized.length > 0 ? normalized : [...ALLOWED_PLATFORMS];
}

function toPostHour(time: string) {
  const hour = Number(time.split(':')[0]);
  if (!Number.isFinite(hour)) return 12;
  return Math.min(23, Math.max(0, hour));
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as GenerateRequestBody;
    const companyName = body.companyName?.trim() || '';
    const objective = body.objective?.trim() || '';
    const days = Math.min(60, Math.max(1, Number(body.days || 30)));
    const platforms = normalizePlatforms(body.platforms);

    if (!companyName) {
      return NextResponse.json({ error: 'companyName is required' }, { status: 400 });
    }
    if (!objective) {
      return NextResponse.json({ error: 'objective is required' }, { status: 400 });
    }

    const requirements = {
      dailyThemes: body.requirements?.dailyThemes ?? true,
      platformSpecific: body.requirements?.platformSpecific ?? true,
      analytics: body.requirements?.analytics ?? true,
    };

    const draftItems = generateCalendarDraft({
      companyName,
      objective,
      platforms,
      days,
      requirements,
    });

    const recentPostCount = await prisma.post.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const followerCount = Number(body.followerCount || 5000);

    const featureRows = draftItems.map((item, index) => {
      const seed = ((index * 11) % 17) / 10;
      const creativeScore = Math.min(9.5, 6 + seed);

      return buildModelFeaturesFromPost({
        platform: item.platform,
        date: item.date,
        title: `${item.theme} - ${companyName}`,
        description: `${item.postIdea}\n${item.captionDraft}\n${item.hashtags.join(' ')}`,
        postsLast7Days: recentPostCount + Math.floor(index / 3),
        followerCount,
        creativeScore,
        postHour: toPostHour(item.recommendedTime),
      });
    });

    const predictions = await predictEngagementRateBatch(featureRows);
    const items = draftItems.map((item, index) => ({
      ...item,
      predictedEngagementRate: predictions[index].rate,
      predictedEngagementPercent: predictions[index].percent,
      modelProvider: predictions[index].provider,
      modelVersion: predictions[index].modelVersion,
      modelWarning: predictions[index].warning ?? null,
    }));

    return NextResponse.json({
      meta: {
        companyName,
        objective,
        days,
        generatedAt: new Date().toISOString(),
      },
      items,
    });
  } catch (error) {
    console.error('POST /api/generate-calendar error:', error);
    return NextResponse.json({ error: 'Failed to generate calendar plan' }, { status: 500 });
  }
}
