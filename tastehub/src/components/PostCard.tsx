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
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const platformInfo = getPlatformInfo(post.platform);

  const handleStatusChange = (newStatus: 'draft' | 'scheduled' | 'published') => {
    updatePost(post.id, { status: newStatus });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${platformInfo.color} rounded-full flex items-center justify-center text-lg`}>
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">{platformInfo.label}</span>
              <span className="text-gray-300">•</span>
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
            className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${getStatusColor(post.status)}`}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={() => deletePost(post.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete post"
          >
            🗑️
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{post.description}</p>

      {showEngagement && post.engagement && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{post.engagement.likes}</div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{post.engagement.comments}</div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{post.engagement.shares}</div>
              <div className="text-xs text-gray-500">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{post.engagement.reach}</div>
              <div className="text-xs text-gray-500">Reach</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
