export type Platform = 'instagram' | 'facebook' | 'twitter';

export interface Post {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  date: string; // ISO date string
  status: 'draft' | 'scheduled' | 'published';
  engagement?: Engagement;
  topComments?: TopComment[];
  createdAt: string;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface TopComment {
  id: string;
  postId: string;
  rank: number;
  author?: string | null;
  body: string;
  likes: number;
  sentiment?: string | null;
}

export interface MLInsight {
  id: string;
  userId: string;
  postId: string | null;
  inputLikes: number;
  inputComments: number;
  inputShares: number;
  inputReach: number;
  inputTopComments: string[];
  summary: string;
  actionItems: string[];
  confidence?: number | null;
  modelVersion?: string | null;
  createdAt: string;
  predictedEngagementRate?: number | null;
  predictedEngagementPercent?: number | null;
  modelProvider?: 'python-model' | 'heuristic-fallback';
  modelWarning?: string | null;
  post?: {
    id: string;
    title: string;
    platform: Platform;
  } | null;
}

export interface PlatformStrategy {
  platform: Platform;
  icon: string;
  color: string;
  suggestions: string[];
  bestPractices: string[];
}

export const platformStrategies: Record<Platform, PlatformStrategy> = {
  instagram: {
    platform: 'instagram',
    icon: '📸',
    color: '#E4405F',
    suggestions: [
      'Create engaging Reels (15-60 seconds)',
      'Use carousel posts for tutorials',
      'Post high-quality photos',
      'Add Stories with polls/questions',
      'Use relevant hashtags (5-10)',
    ],
    bestPractices: [
      'Post during peak hours (11 AM - 1 PM, 7 PM - 9 PM)',
      'Maintain a consistent visual aesthetic',
      'Engage with comments within first hour',
      'Use Instagram-specific features (Reels, Stories)',
    ],
  },
  facebook: {
    platform: 'facebook',
    icon: '📘',
    color: '#1877F2',
    suggestions: [
      'Write longer, detailed posts',
      'Share articles and blog content',
      'Create Facebook Events',
      'Post videos (3-5 minutes optimal)',
      'Use Facebook Groups for community',
    ],
    bestPractices: [
      'Post 1-2 times per day',
      'Use eye-catching thumbnails',
      'Ask questions to boost engagement',
      'Share behind-the-scenes content',
    ],
  },
  twitter: {
    platform: 'twitter',
    icon: '🐦',
    color: '#1DA1F2',
    suggestions: [
      'Keep tweets under 280 characters',
      'Use threads for longer content',
      'Add relevant hashtags (1-2)',
      'Include images or GIFs',
      'Engage in trending conversations',
    ],
    bestPractices: [
      'Post 3-5 times daily',
      'Tweet during business hours',
      'Retweet and quote tweet others',
      'Use Twitter polls for engagement',
    ],
  },
};
