import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Post, Engagement, TopComment } from '@/generated/prisma/client';

type PostWithRelations = Post & {
  engagement: Engagement | null;
  topComments: TopComment[];
};

// GET all posts for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      include: {
        engagement: true,
        topComments: { orderBy: { rank: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend Post type
    const transformed = posts.map((p: PostWithRelations) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      platform: p.platform,
      date: p.date,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      engagement: p.engagement
        ? {
            likes: p.engagement.likes,
            comments: p.engagement.comments,
            shares: p.engagement.shares,
            reach: p.engagement.reach,
          }
        : undefined,
      topComments: p.topComments,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description,
        platform: body.platform,
        date: body.date,
        status: body.status || 'draft',
      },
      include: { engagement: true },
    });

    return NextResponse.json(
      {
        id: post.id,
        title: post.title,
        description: post.description,
        platform: post.platform,
        date: post.date,
        status: post.status,
        createdAt: post.createdAt.toISOString(),
        engagement: post.engagement
          ? {
              likes: post.engagement.likes,
              comments: post.engagement.comments,
              shares: post.engagement.shares,
              reach: post.engagement.reach,
            }
          : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
