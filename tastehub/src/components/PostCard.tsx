'use client';

import { Post } from '@/types';
import { usePosts } from '@/context/PostContext';

interface PostCardProps {
  post: Post;
  showEngagement?: boolean;
}

export default function PostCard({ post, showEngagement = true }: PostCardProps) {
  const { deletePost, updatePost } = usePosts();

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return { icon: '📸', color: 'bg-pink-500', label: 'Instagram' };
      case 'facebook':
        return { icon: '📘', color: 'bg-blue-600', label: 'Facebook' };
      case 'twitter':
        return { icon: '🐦', color: 'bg-sky-400', label: 'Twitter' };
      default:
        return { icon: '📱', color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'scheduled': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'published': return 'bg-green-500/10 text-green-400 border border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  const platformInfo = getPlatformInfo(post.platform);

  const handleStatusChange = (newStatus: 'draft' | 'scheduled' | 'published') => {
    updatePost(post.id, { status: newStatus });
  };

  return (
    <div className="bg-[#111118] rounded-lg border border-[#2a2a3a] p-5 hover:border-[#3a3a4a] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${platformInfo.color} rounded-full flex items-center justify-center text-lg`}>
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{post.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">{platformInfo.label}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-500">
                {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={post.status}
            onChange={(e) => handleStatusChange(e.target.value as 'draft' | 'scheduled' | 'published')}
            className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer bg-[#0a0a0f] ${getStatusColor(post.status)}`}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={() => deletePost(post.id)}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Delete post"
          >
            🗑️
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-400 line-clamp-2">{post.description}</p>

      {showEngagement && post.engagement && (
        <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-[#00f0ff] font-mono">{post.engagement.likes}</div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#ff00e5] font-mono">{post.engagement.comments}</div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#00ff88] font-mono">{post.engagement.shares}</div>
              <div className="text-xs text-gray-500">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#ff8800] font-mono">{post.engagement.reach}</div>
              <div className="text-xs text-gray-500">Reach</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
