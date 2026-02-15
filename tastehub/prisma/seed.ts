import 'dotenv/config';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@tastehub.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@tastehub.com',
      password: hashedPassword,
      bio: 'Social media manager & content creator',
    },
  });
  console.log(`  ✔ User: ${user.email}`);

  // Create posts with engagement
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const postsData = [
    {
      title: 'New Recipe Launch',
      description: 'Introducing our new summer salad recipe! Fresh ingredients, amazing taste.',
      platform: 'instagram',
      date: today,
      status: 'published',
      engagement: { likes: 245, comments: 32, shares: 18, reach: 1520 },
      topComments: [
        { rank: 1, author: '@foodie_sarah', body: 'This looks absolutely delicious! Making it tonight 🤤', likes: 14, sentiment: 'positive' },
        { rank: 2, author: '@chef_mike', body: 'Great presentation! What dressing did you use?', likes: 9, sentiment: 'positive' },
        { rank: 3, author: '@healthyeats', body: 'Perfect for summer! Love the fresh ingredients', likes: 7, sentiment: 'positive' },
        { rank: 4, author: '@cooking_daily', body: 'Would love to see a video tutorial for this!', likes: 5, sentiment: 'positive' },
        { rank: 5, author: '@veganlover', body: 'Is there a vegan version of this recipe?', likes: 3, sentiment: 'neutral' },
      ],
    },
    {
      title: 'Customer Spotlight',
      description: 'Thank you @foodlover123 for sharing your amazing creation with our products!',
      platform: 'twitter',
      date: tomorrow,
      status: 'scheduled',
      engagement: { likes: 89, comments: 12, shares: 24, reach: 780 },
      topComments: [
        { rank: 1, author: '@foodlover123', body: 'So honored to be featured! Love your products! ❤️', likes: 22, sentiment: 'positive' },
        { rank: 2, author: '@home_chef', body: 'Your products are the best on the market', likes: 8, sentiment: 'positive' },
      ],
    },
    {
      title: 'Weekend Special Offer',
      description: 'Get 20% off all premium ingredients this weekend! Use code TASTEHUB20 at checkout.',
      platform: 'facebook',
      date: dayAfter,
      status: 'draft',
      engagement: undefined,
      topComments: [],
    },
  ];

  for (const postData of postsData) {
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title: postData.title,
        description: postData.description,
        platform: postData.platform,
        date: postData.date,
        status: postData.status,
        ...(postData.engagement
          ? {
              engagement: {
                create: postData.engagement,
              },
            }
          : {}),
        ...(postData.topComments.length > 0
          ? {
              topComments: {
                create: postData.topComments,
              },
            }
          : {}),
      },
    });
    console.log(`  ✔ Post: ${post.title} (${post.platform})`);
  }

  // Create calendar events
  const events = [
    { title: 'Content Planning Meeting', date: today, type: 'meeting', color: '#00f0ff' },
    { title: 'Instagram Campaign Launch', date: tomorrow, type: 'campaign', color: '#ff00e5' },
    { title: 'Analytics Review', date: dayAfter, type: 'reminder', color: '#00ff88' },
  ];

  for (const event of events) {
    await prisma.calendarEvent.create({
      data: { userId: user.id, ...event },
    });
    console.log(`  ✔ Event: ${event.title}`);
  }

  // Create a sample ML insight
  await prisma.mLInsight.create({
    data: {
      userId: user.id,
      inputLikes: 245,
      inputComments: 32,
      inputShares: 18,
      inputReach: 1520,
      inputTopComments: JSON.stringify([
        'This looks absolutely delicious!',
        'Great presentation! What dressing did you use?',
        'Perfect for summer!',
        'Would love to see a video tutorial!',
        'Is there a vegan version?',
      ]),
      summary: 'Your recipe content is performing well. Audience is highly engaged and requesting more video content and dietary variations.',
      actionItems: JSON.stringify([
        'Create a video tutorial for the summer salad recipe',
        'Develop vegan alternatives for your top recipes',
        'Post more behind-the-scenes cooking content',
        'Engage with comments within the first hour of posting',
        'Use Instagram Reels for recipe walkthroughs',
      ]),
      confidence: 0.87,
      modelVersion: 'v1.0-seed',
    },
  });
  console.log(`  ✔ ML Insight: sample recommendation`);

  // Create platform snapshot
  await prisma.platformSnapshot.create({
    data: {
      platform: 'instagram',
      totalPosts: 1,
      totalLikes: 245,
      totalComments: 32,
      totalShares: 18,
      totalReach: 1520,
      snapshotDate: today,
    },
  });
  console.log(`  ✔ Platform snapshot: instagram`);

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
