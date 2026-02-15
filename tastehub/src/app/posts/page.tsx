'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePosts } from '@/context/PostContext';
import type { Platform } from '@/types';
import { PostCard } from '@/components';

type PlatformFilter = Platform | 'all';
type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published';

export default function PostsPage() {
  const { posts, loading } = usePosts();
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const platformMatch = platformFilter === 'all' || post.platform === platformFilter;
      const statusMatch = statusFilter === 'all' || post.status === statusFilter;
      return platformMatch && statusMatch;
    });
  }, [posts, platformFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">All Posts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review drafts, scheduled posts, and published content in one place.
            </p>
          </div>
          <Link
            href="/add-post"
            className="bg-[#00f0ff] text-black px-5 py-2 rounded-md font-semibold hover:bg-[#00d4e0] transition-colors"
          >
            + Create Post
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Platform Filter</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            >
              <option value="all">All platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-10 text-center text-gray-500">
          Loading posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-10 text-center">
          <p className="text-gray-500 mb-4">No posts match your filters.</p>
          <Link
            href="/add-post"
            className="inline-block bg-[#00f0ff] text-black px-6 py-3 rounded-md font-medium hover:bg-[#00d4e0] transition-colors"
          >
            Create New Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} showEngagement={true} />
          ))}
        </div>
      )}
    </div>
  );
}
