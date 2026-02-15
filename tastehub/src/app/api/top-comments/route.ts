import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all top comments for a post
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: session.user.id },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await prisma.topComment.findMany({
      where: { postId },
      orderBy: { rank: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET /api/top-comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST add/update top comments for a post (expects array of up to 5)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, comments } = body;

    if (!postId || !Array.isArray(comments)) {
      return NextResponse.json(
        { error: 'postId and comments array are required' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: session.user.id },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete existing comments for this post, then recreate
    await prisma.topComment.deleteMany({ where: { postId } });

    const created = await Promise.all(
      comments.slice(0, 5).map((comment: { author?: string; body: string; likes?: number; sentiment?: string }, index: number) =>
        prisma.topComment.create({
          data: {
            postId,
            rank: index + 1,
            author: comment.author || null,
            body: comment.body,
            likes: comment.likes || 0,
            sentiment: comment.sentiment || null,
          },
        })
      )
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/top-comments error:', error);
    return NextResponse.json({ error: 'Failed to save comments' }, { status: 500 });
  }
}
