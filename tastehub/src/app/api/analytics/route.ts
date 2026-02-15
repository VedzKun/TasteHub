import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Post, Engagement } from '@/generated/prisma/client';

type PostWithEngagement = Post & { engagement: Engagement | null };

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Aggregate post counts by status
    const posts = await prisma.post.findMany({
      where: { userId },
      include: { engagement: true },
    });

    const overview = {
      totalPosts: posts.length,
      scheduledPosts: posts.filter((p: PostWithEngagement) => p.status === 'scheduled').length,
      publishedPosts: posts.filter((p: PostWithEngagement) => p.status === 'published').length,
      draftPosts: posts.filter((p: PostWithEngagement) => p.status === 'draft').length,
    };

    // Aggregate engagement
    const engagement = posts.reduce(
      (acc: { totalLikes: number; totalComments: number; totalShares: number; totalReach: number }, p: PostWithEngagement) => {
        if (p.engagement) {
          acc.totalLikes += p.engagement.likes;
          acc.totalComments += p.engagement.comments;
          acc.totalShares += p.engagement.shares;
          acc.totalReach += p.engagement.reach;
        }
        return acc;
      },
      { totalLikes: 0, totalComments: 0, totalShares: 0, totalReach: 0 }
    );

    // Platform breakdown
    const platforms = ['instagram', 'facebook', 'twitter'] as const;
    const platformBreakdown: Record<string, { posts: number; likes: number; comments: number; shares: number; reach: number }> = {};
    for (const platform of platforms) {
      const pPosts = posts.filter((p: PostWithEngagement) => p.platform === platform);
      platformBreakdown[platform] = pPosts.reduce(
        (acc: { posts: number; likes: number; comments: number; shares: number; reach: number }, p: PostWithEngagement) => {
          acc.posts++;
          if (p.engagement) {
            acc.likes += p.engagement.likes;
            acc.comments += p.engagement.comments;
            acc.shares += p.engagement.shares;
            acc.reach += p.engagement.reach;
          }
          return acc;
        },
        { posts: 0, likes: 0, comments: 0, shares: 0, reach: 0 }
      );
    }

    // Top performing posts
    const topPerformingPosts = posts
      .filter((p: PostWithEngagement) => p.engagement)
      .map((p: PostWithEngagement) => ({
        id: p.id,
        title: p.title,
        engagement: (p.engagement!.likes + p.engagement!.comments + p.engagement!.shares),
        platform: p.platform,
      }))
      .sort((a: { engagement: number }, b: { engagement: number }) => b.engagement - a.engagement)
      .slice(0, 5);

    return NextResponse.json({
      overview,
      engagement,
      platformBreakdown,
      topPerformingPosts,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, engagement } = body;

    const updated = await prisma.engagement.upsert({
      where: { postId },
      update: engagement,
      create: { postId, ...engagement },
    });

    return NextResponse.json({
      message: `Updated engagement for post ${postId}`,
      engagement: updated,
    });
  } catch (error) {
    console.error('POST /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 400 });
  }
}
