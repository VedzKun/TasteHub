'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/context/PostContext';
import { Platform, platformStrategies } from '@/types';
import PlatformSuggestions from './PlatformSuggestions';

export default function PostForm() {
  const router = useRouter();
  const { addPost } = usePosts();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'instagram' as Platform,
    date: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'scheduled' | 'published',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPost(formData);
    router.push('/');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Post</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter post title..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['instagram', 'facebook', 'twitter'] as Platform[]).map((platform) => {
                const strategy = platformStrategies[platform];
                const isSelected = formData.platform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, platform }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{strategy.icon}</div>
                    <div className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Post Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Write your post content here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.description.length} characters
              {formData.platform === 'twitter' && formData.description.length > 280 && (
                <span className="text-red-500 ml-2">(exceeds Twitter limit)</span>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Post Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Platform Suggestions */}
      <div className="lg:col-span-1">
        <PlatformSuggestions platform={formData.platform} />
      </div>
    </div>
  );
}
