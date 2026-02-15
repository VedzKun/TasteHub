'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePosts } from '@/context/PostContext';
import type { MLInsight } from '@/types';

export default function MLInsightsPanel() {
  const { posts } = usePosts();
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [followerCount, setFollowerCount] = useState(5000);
  const [creativeScore, setCreativeScore] = useState(6.5);
  const [postHour, setPostHour] = useState(12);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId),
    [posts, selectedPostId]
  );

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml-insights');
      if (!response.ok) {
        throw new Error('Failed to load AI insights');
      }
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    if (!selectedPostId && posts.length > 0) {
      setSelectedPostId(posts[0].id);
    }
  }, [posts, selectedPostId]);

  const handleGenerate = async () => {
    if (!selectedPostId) {
      setError('Select a post first.');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          followerCount,
          creativeScore,
          postHour,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate insight');
      }

      setInsights((prev) => [payload, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insight');
    } finally {
      setIsGenerating(false);
    }
  };

  const latestInsight = insights[0];

  return (
    <div className="space-y-6">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-bold text-white">AI Engagement Predictor</h3>
            <p className="text-sm text-gray-500 mt-1">
              Run your `TasteHubAI` model against a scheduled post and store recommendations.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedPostId}
            className="bg-[#00f0ff] text-black px-5 py-2 rounded-md font-semibold hover:bg-[#00d4e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Insight'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 block">Select Post</label>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            >
              {posts.length === 0 ? <option value="">No posts found</option> : null}
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} ({post.platform})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 block">Follower Count</label>
            <input
              type="number"
              min={0}
              value={followerCount}
              onChange={(e) => setFollowerCount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 block">Creative Score (0-10)</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={creativeScore}
              onChange={(e) =>
                setCreativeScore(Math.min(10, Math.max(0, Number(e.target.value) || 0)))
              }
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 block">Posting Hour (0-23)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={postHour}
              onChange={(e) => setPostHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            />
          </div>
        </div>

        {selectedPost ? (
          <div className="mt-4 text-sm text-gray-500">
            Selected: <span className="text-gray-300">{selectedPost.title}</span> for{' '}
            <span className="capitalize text-gray-300">{selectedPost.platform}</span> on{' '}
            <span className="text-gray-300">{selectedPost.date}</span>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      ) : null}

      {latestInsight ? (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h4 className="text-lg font-bold text-white">Latest AI Insight</h4>
            <span className="text-xs text-gray-500">
              {new Date(latestInsight.createdAt).toLocaleString('en-US')}
            </span>
          </div>

          {latestInsight.predictedEngagementPercent != null ? (
            <div className="mt-4 p-4 rounded-md bg-[#0a0a0f] border border-[#2a2a3a]">
              <div className="text-sm text-gray-400">Predicted Engagement Rate</div>
              <div className="text-3xl font-bold text-[#00ff88] mt-1">
                {latestInsight.predictedEngagementPercent.toFixed(2)}%
              </div>
              {latestInsight.modelProvider ? (
                <div className="text-xs text-gray-500 mt-1">
                  Model source: {latestInsight.modelProvider}
                </div>
              ) : null}
              {latestInsight.modelWarning ? (
                <div className="text-xs text-yellow-300 mt-2">{latestInsight.modelWarning}</div>
              ) : null}
            </div>
          ) : null}

          <p className="mt-4 text-gray-300 text-sm leading-relaxed">{latestInsight.summary}</p>

          {latestInsight.actionItems.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-white mb-2">Recommended Actions</p>
              <ul className="space-y-2">
                {latestInsight.actionItems.map((item, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-[#00f0ff] mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-4">Insight History</h4>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading insights...</p>
        ) : insights.length === 0 ? (
          <p className="text-gray-500 text-sm">No insights yet. Generate your first AI insight.</p>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 8).map((insight) => (
              <div
                key={insight.id}
                className="rounded-md border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-300">
                    {insight.post?.title || 'General Insight'}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(insight.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{insight.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
