import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: { id, userId: session.user.id },
      include: {
        engagement: true,
        topComments: { orderBy: { rank: 'asc' } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
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
      topComments: post.topComments,
    });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.post.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Separate engagement data from post data
    const { engagement, ...postData } = body;

    await prisma.post.update({
      where: { id },
      data: {
        ...(postData.title && { title: postData.title }),
        ...(postData.description && { description: postData.description }),
        ...(postData.platform && { platform: postData.platform }),
        ...(postData.date && { date: postData.date }),
        ...(postData.status && { status: postData.status }),
      },
      include: { engagement: true },
    });

    // Upsert engagement if provided
    if (engagement) {
      await prisma.engagement.upsert({
        where: { postId: id },
        update: engagement,
        create: { postId: id, ...engagement },
      });
    }

    const updated = await prisma.post.findUnique({
      where: { id },
      include: { engagement: true, topComments: { orderBy: { rank: 'asc' } } },
    });

    return NextResponse.json({
      id: updated!.id,
      title: updated!.title,
      description: updated!.description,
      platform: updated!.platform,
      date: updated!.date,
      status: updated!.status,
      createdAt: updated!.createdAt.toISOString(),
      engagement: updated!.engagement
        ? {
            likes: updated!.engagement.likes,
            comments: updated!.engagement.comments,
            shares: updated!.engagement.shares,
            reach: updated!.engagement.reach,
          }
        : undefined,
    });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.post.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 400 });
  }
}
