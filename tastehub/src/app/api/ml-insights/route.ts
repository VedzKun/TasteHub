import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { MLInsight, Post } from '@/generated/prisma/client';

type InsightWithPost = MLInsight & {
  post: Pick<Post, 'id' | 'title' | 'platform'> | null;
};

// GET all ML insights for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await prisma.mLInsight.findMany({
      where: { userId: session.user.id },
      include: { post: { select: { id: true, title: true, platform: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = insights.map((i: InsightWithPost) => ({
      ...i,
      inputTopComments: i.inputTopComments ? JSON.parse(i.inputTopComments) : [],
      actionItems: i.actionItems ? JSON.parse(i.actionItems) : [],
      createdAt: i.createdAt.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('GET /api/ml-insights error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

// POST create a new ML insight (stores model input + output)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const insight = await prisma.mLInsight.create({
      data: {
        userId: session.user.id,
        postId: body.postId || null,
        inputLikes: body.inputLikes,
        inputComments: body.inputComments,
        inputShares: body.inputShares,
        inputReach: body.inputReach || 0,
        inputTopComments: body.inputTopComments
          ? JSON.stringify(body.inputTopComments)
          : null,
        summary: body.summary,
        actionItems: body.actionItems
          ? JSON.stringify(body.actionItems)
          : null,
        confidence: body.confidence || null,
        modelVersion: body.modelVersion || null,
      },
    });

    return NextResponse.json(
      {
        ...insight,
        inputTopComments: insight.inputTopComments
          ? JSON.parse(insight.inputTopComments)
          : [],
        actionItems: insight.actionItems
          ? JSON.parse(insight.actionItems)
          : [],
        createdAt: insight.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ml-insights error:', error);
    return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 });
  }
}
