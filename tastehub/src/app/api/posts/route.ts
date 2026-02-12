import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/types';

// In-memory storage for demo purposes
// In production, use a database
let posts: Post[] = [
  {
    id: '1',
    title: 'New Recipe Launch',
    description: 'Introducing our new summer salad recipe! Fresh ingredients, amazing taste.',
    platform: 'instagram',
    date: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    engagement: { likes: 245, comments: 32, shares: 18, reach: 1520 },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Customer Spotlight',
    description: 'Thank you @foodlover123 for sharing your amazing creation with our products!',
    platform: 'twitter',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Weekend Special Offer',
    description: 'Get 20% off all premium ingredients this weekend! Use code TASTEHUB20 at checkout.',
    platform: 'facebook',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

// GET all posts
export async function GET() {
  return NextResponse.json(posts);
}

// POST create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPost: Post = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      platform: body.platform,
      date: body.date,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
    };
    
    posts.push(newPost);
    
    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 400 }
    );
  }
}
