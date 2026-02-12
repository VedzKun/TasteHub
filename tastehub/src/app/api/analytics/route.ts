import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Sample analytics data
  // In production, calculate from database
  const analytics = {
    overview: {
      totalPosts: 15,
      scheduledPosts: 8,
      publishedPosts: 5,
      draftPosts: 2,
    },
    engagement: {
      totalLikes: 1520,
      totalComments: 245,
      totalShares: 89,
      totalReach: 12500,
    },
    platformBreakdown: {
      instagram: {
        posts: 6,
        likes: 890,
        comments: 156,
        shares: 45,
        reach: 7200,
      },
      facebook: {
        posts: 5,
        likes: 420,
        comments: 67,
        shares: 34,
        reach: 3800,
      },
      twitter: {
        posts: 4,
        likes: 210,
        comments: 22,
        shares: 10,
        reach: 1500,
      },
    },
    topPerformingPosts: [
      { id: '1', title: 'New Recipe Launch', engagement: 295, platform: 'instagram' },
      { id: '5', title: 'Behind the Scenes', engagement: 187, platform: 'instagram' },
      { id: '3', title: 'Weekend Special', engagement: 156, platform: 'facebook' },
    ],
  };

  return NextResponse.json(analytics);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, engagement } = body;

    // In production, update the database
    return NextResponse.json({
      message: `Updated engagement for post ${postId}`,
      engagement,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 400 }
    );
  }
}
