'use client';

import { useState } from 'react';
import { usePosts } from '@/context/PostContext';
import { Platform, Engagement } from '@/types';
import PostCard from './PostCard';

export default function AnalyticsDashboard() {
  const { posts, updateEngagement } = usePosts();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [engagementForm, setEngagementForm] = useState<Engagement>({
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
  });

  const filteredPosts = selectedPlatform === 'all'
    ? posts
    : posts.filter((post) => post.platform === selectedPlatform);

  // Calculate totals
  const totals = posts.reduce(
    (acc, post) => {
      if (post.engagement) {
        acc.likes += post.engagement.likes;
        acc.comments += post.engagement.comments;
        acc.shares += post.engagement.shares;
        acc.reach += post.engagement.reach;
      }
      return acc;
    },
    { likes: 0, comments: 0, shares: 0, reach: 0 }
  );

  // Calculate platform breakdown
  const platformStats = (['instagram', 'facebook', 'twitter'] as Platform[]).map((platform) => {
    const platformPosts = posts.filter((p) => p.platform === platform);
    const stats = platformPosts.reduce(
      (acc, post) => {
        if (post.engagement) {
          acc.likes += post.engagement.likes;
          acc.comments += post.engagement.comments;
          acc.shares += post.engagement.shares;
          acc.reach += post.engagement.reach;
        }
        return acc;
      },
      { likes: 0, comments: 0, shares: 0, reach: 0, count: platformPosts.length }
    );
    return { platform, ...stats };
  });

  const handleEditEngagement = (postId: string, currentEngagement?: Engagement) => {
    setEditingPostId(postId);
    setEngagementForm(currentEngagement || { likes: 0, comments: 0, shares: 0, reach: 0 });
  };

  const handleSaveEngagement = () => {
    if (editingPostId) {
      updateEngagement(editingPostId, engagementForm);
      setEditingPostId(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📸';
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-500';
      case 'facebook': return 'from-blue-600 to-blue-700';
      case 'twitter': return 'from-sky-400 to-sky-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">❤️</div>
            <div className="text-3xl font-bold text-gray-800">{totals.likes.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Likes</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-3xl font-bold text-gray-800">{totals.comments.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Comments</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-3xl font-bold text-gray-800">{totals.shares.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Shares</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-3xl font-bold text-gray-800">{totals.reach.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Reach</div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformStats.map(({ platform, likes, comments, shares, reach, count }) => (
            <div
              key={platform}
              className={`bg-gradient-to-r ${getPlatformColor(platform)} rounded-xl shadow-sm p-6 text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{getPlatformIcon(platform)}</div>
                <div className="text-sm opacity-80">{count} posts</div>
              </div>
              <h3 className="text-lg font-bold mb-3 capitalize">{platform}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-bold">{likes}</div>
                  <div className="opacity-80">Likes</div>
                </div>
                <div>
                  <div className="font-bold">{comments}</div>
                  <div className="opacity-80">Comments</div>
                </div>
                <div>
                  <div className="font-bold">{shares}</div>
                  <div className="opacity-80">Shares</div>
                </div>
                <div>
                  <div className="font-bold">{reach}</div>
                  <div className="opacity-80">Reach</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts List with Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Post Analytics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {(['instagram', 'facebook', 'twitter'] as Platform[]).map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPlatform === platform
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getPlatformIcon(platform)}
              </button>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500">No posts found. Create your first post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                <PostCard post={post} showEngagement={true} />
                <button
                  onClick={() => handleEditEngagement(post.id, post.engagement)}
                  className="absolute top-4 right-16 text-sm text-orange-500 hover:text-orange-600"
                >
                  ✏️ Edit Metrics
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Engagement Modal */}
      {editingPostId && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Update Engagement Metrics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
                <input
                  type="number"
                  value={engagementForm.likes}
                  onChange={(e) => setEngagementForm((prev) => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <input
                  type="number"
                  value={engagementForm.comments}
                  onChange={(e) => setEngagementForm((prev) => ({ ...prev, comments: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shares</label>
                <input
                  type="number"
                  value={engagementForm.shares}
                  onChange={(e) => setEngagementForm((prev) => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reach</label>
                <input
                  type="number"
                  value={engagementForm.reach}
                  onChange={(e) => setEngagementForm((prev) => ({ ...prev, reach: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSaveEngagement}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPostId(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
