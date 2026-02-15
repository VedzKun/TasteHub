import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildModelFeaturesFromPost, predictEngagementRate } from '@/lib/mlPredictor';
import type { Engagement, MLInsight, Post, TopComment } from '@/generated/prisma/client';

type InsightWithPost = MLInsight & {
  post: Pick<Post, 'id' | 'title' | 'platform'> | null;
};

type PostWithRelations = Post & {
  engagement: Engagement | null;
  topComments: Pick<TopComment, 'body'>[];
};

function parseJsonArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractPredictionRate(summary: string) {
  const match = summary.match(/Predicted engagement rate:\s*([0-9.]+)%/i);
  if (!match) return null;
  const percent = Number(match[1]);
  if (!Number.isFinite(percent)) return null;
  return Number((percent / 100).toFixed(4));
}

function buildInsightCopy(args: {
  post: Pick<Post, 'platform' | 'title'>;
  predictedPercent: number;
  goal: string;
  topCommentBodies: string[];
}) {
  const { post, predictedPercent, goal, topCommentBodies } = args;

  const performanceBand =
    predictedPercent >= 5.5 ? 'strong'
    : predictedPercent >= 4.2 ? 'steady'
    : 'below-target';

  const summary =
    performanceBand === 'strong'
      ? `Predicted engagement rate: ${predictedPercent.toFixed(2)}%. This ${post.platform} post is likely to perform strongly. Keep the message focused on ${goal} and publish as scheduled.`
      : performanceBand === 'steady'
        ? `Predicted engagement rate: ${predictedPercent.toFixed(2)}%. This ${post.platform} post is expected to perform steadily, but there is room to improve hook and CTA clarity.`
        : `Predicted engagement rate: ${predictedPercent.toFixed(2)}%. This ${post.platform} post may underperform unless you strengthen the opening line and CTA before publishing.`;

  const actionItems: string[] = [];

  if (post.platform === 'instagram') {
    actionItems.push('Use 5-8 targeted hashtags and add one explicit CTA in the first 120 characters.');
    actionItems.push('Prioritize a Reel or carousel format for higher retention on Instagram.');
  } else if (post.platform === 'facebook') {
    actionItems.push('Use a clear first sentence and add a question to drive comment volume.');
    actionItems.push('Attach a strong visual and keep the CTA in the final sentence.');
  } else {
    actionItems.push('Keep the post concise and front-load the core value in the first line.');
    actionItems.push('Use one clear CTA (reply, share, or link click) to reduce decision friction.');
  }

  if (topCommentBodies.length > 0) {
    actionItems.push('Reuse language patterns from your highest-liked recent comments to improve resonance.');
  }

  if (performanceBand !== 'strong') {
    actionItems.push('Run an A/B caption variation and compare engagement after 24 hours.');
  }

  const confidence =
    performanceBand === 'strong' ? 0.88
    : performanceBand === 'steady' ? 0.8
    : 0.72;

  return { summary, actionItems, confidence };
}

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
      ...(() => {
        const predictedRate = extractPredictionRate(i.summary);
        return {
          predictedEngagementRate: predictedRate,
          predictedEngagementPercent:
            predictedRate != null ? Number((predictedRate * 100).toFixed(2)) : null,
        };
      })(),
      ...i,
      inputTopComments: parseJsonArray(i.inputTopComments),
      actionItems: parseJsonArray(i.actionItems),
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

    if (body.postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: body.postId,
          userId: session.user.id,
        },
        include: {
          engagement: true,
          topComments: {
            select: { body: true },
            orderBy: { rank: 'asc' },
          },
        },
      });

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const postsLast7Days = await prisma.post.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      const typedPost = post as PostWithRelations;
      const features = buildModelFeaturesFromPost({
        platform: typedPost.platform,
        date: typedPost.date,
        title: typedPost.title,
        description: typedPost.description,
        postsLast7Days,
        followerCount: body.followerCount,
        creativeScore: body.creativeScore,
        postHour: body.postHour,
      });

      const prediction = await predictEngagementRate(features);
      const topCommentBodies = typedPost.topComments.map((comment) => comment.body);

      const insightCopy = buildInsightCopy({
        post: { platform: typedPost.platform, title: typedPost.title },
        predictedPercent: prediction.percent,
        goal: prediction.features.goal,
        topCommentBodies,
      });

      const insight = await prisma.mLInsight.create({
        data: {
          userId: session.user.id,
          postId: typedPost.id,
          inputLikes: typedPost.engagement?.likes ?? 0,
          inputComments: typedPost.engagement?.comments ?? 0,
          inputShares: typedPost.engagement?.shares ?? 0,
          inputReach: typedPost.engagement?.reach ?? 0,
          inputTopComments: topCommentBodies.length > 0 ? JSON.stringify(topCommentBodies) : null,
          summary: insightCopy.summary,
          actionItems: JSON.stringify(insightCopy.actionItems),
          confidence: insightCopy.confidence,
          modelVersion: prediction.modelVersion,
        },
      });

      return NextResponse.json(
        {
          ...insight,
          inputTopComments: parseJsonArray(insight.inputTopComments),
          actionItems: parseJsonArray(insight.actionItems),
          predictedEngagementRate: prediction.rate,
          predictedEngagementPercent: prediction.percent,
          modelProvider: prediction.provider,
          featureSnapshot: prediction.features,
          modelWarning: prediction.warning ?? null,
          createdAt: insight.createdAt.toISOString(),
        },
        { status: 201 }
      );
    }

    const insight = await prisma.mLInsight.create({
      data: {
        userId: session.user.id,
        postId: body.postId || null,
        inputLikes: body.inputLikes ?? 0,
        inputComments: body.inputComments ?? 0,
        inputShares: body.inputShares ?? 0,
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
        ...(() => {
          const predictedRate = extractPredictionRate(insight.summary);
          return {
            predictedEngagementRate: predictedRate,
            predictedEngagementPercent:
              predictedRate != null ? Number((predictedRate * 100).toFixed(2)) : null,
          };
        })(),
        ...insight,
        inputTopComments: parseJsonArray(insight.inputTopComments),
        actionItems: parseJsonArray(insight.actionItems),
        createdAt: insight.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ml-insights error:', error);
    return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 });
  }
}
