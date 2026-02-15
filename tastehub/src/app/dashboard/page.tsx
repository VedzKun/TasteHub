'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Post } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduled: 0,
    published: 0,
    drafts: 0,
    totalEngagement: 0,
    totalReach: 0,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const calculateStats = (postsData: Post[]) => {
    const scheduled = postsData.filter((p) => p.status === 'scheduled').length;
    const published = postsData.filter((p) => p.status === 'published').length;
    const drafts = postsData.filter((p) => p.status === 'draft').length;

    const totalEngagement = postsData.reduce((sum, post) => {
      if (post.engagement) {
        return sum + post.engagement.likes + post.engagement.comments + post.engagement.shares;
      }
      return sum;
    }, 0);

    const totalReach = postsData.reduce((sum, post) => {
      return sum + (post.engagement?.reach || 0);
    }, 0);

    setStats({ totalPosts: postsData.length, scheduled, published, drafts, totalEngagement, totalReach });
  };

  const recentPosts = posts.slice(0, 5);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Reach */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 glow-cyan">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Reach</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {stats.totalReach >= 1000
                ? `${(stats.totalReach / 1000).toFixed(1)}K`
                : stats.totalReach}
            </p>
            <p className="text-[#00ff88] text-xs mt-2 neon-green">↑ 12% from last week</p>
          </div>

          {/* Engagement */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 glow-cyan">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Engagement</span>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {stats.totalEngagement.toLocaleString()}
            </p>
            <p className="text-[#00ff88] text-xs mt-2 neon-green">↑ 8% from last week</p>
          </div>

          {/* Posts Scheduled */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Posts Scheduled</span>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{stats.scheduled}</p>
          </div>

          {/* Pending Posts */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">Pending Posts</span>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-[#ff00e5] font-mono neon-magenta">{stats.drafts}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <Link href="/calendar" className="text-[#00f0ff] text-sm hover:underline">
            View All →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts yet</p>
            <Link
              href="/add-post"
              className="inline-block bg-[#00f0ff] text-black px-6 py-3 rounded-md font-medium hover:bg-[#00d4e0] transition-colors"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-4 border-b border-[#1e1e2e] last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#1a1a2e] rounded-full flex items-center justify-center text-lg">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{post.platform}</p>
                    <p className="text-gray-500 text-sm">
                      {post.status === 'published' ? 'Post published' :
                       post.status === 'scheduled' ? 'Post scheduled' : 'Draft saved'}
                    </p>
                  </div>
                </div>
                <span className="text-gray-500 text-sm font-mono">
                  {getTimeAgo(post.createdAt || post.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 hover:border-pink-500/40 transition-colors">
          <div className="text-3xl mb-3">📸</div>
          <h3 className="text-lg font-bold text-white mb-1">Instagram</h3>
          <p className="text-gray-500 text-sm mb-3">Reels & Stories</p>
          <p className="text-2xl font-bold text-[#ff00e5] font-mono neon-magenta">
            {posts.filter((p) => p.platform === 'instagram').length} posts
          </p>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 hover:border-blue-500/40 transition-colors">
          <div className="text-3xl mb-3">📘</div>
          <h3 className="text-lg font-bold text-white mb-1">Facebook</h3>
          <p className="text-gray-500 text-sm mb-3">Posts & Videos</p>
          <p className="text-2xl font-bold text-[#00f0ff] font-mono neon-cyan">
            {posts.filter((p) => p.platform === 'facebook').length} posts
          </p>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 hover:border-cyan-500/40 transition-colors">
          <div className="text-3xl mb-3">🐦</div>
          <h3 className="text-lg font-bold text-white mb-1">Twitter</h3>
          <p className="text-gray-500 text-sm mb-3">Tweets & Threads</p>
          <p className="text-2xl font-bold text-[#00ff88] font-mono neon-green">
            {posts.filter((p) => p.platform === 'twitter').length} posts
          </p>
        </div>
      </div>
    </div>
  );
}
