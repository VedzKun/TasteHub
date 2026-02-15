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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPost(formData);
    router.push('/calendar');
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
        <form onSubmit={handleSubmit} className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">Create New Post</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
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
              className="w-full px-4 py-3 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all"
            />
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-400 mb-2">
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
                    className={`p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#00f0ff] bg-[#00f0ff]/10'
                        : 'border-[#2a2a3a] hover:border-[#3a3a4a] bg-[#0a0a0f]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{strategy.icon}</div>
                    <div className={`text-sm font-medium ${isSelected ? 'text-[#00f0ff]' : 'text-gray-400'}`}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2">
              Schedule Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
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
              className="w-full px-4 py-3 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all resize-none"
            />
            <div className="mt-1 text-sm text-gray-500">
              {formData.description.length} characters
              {formData.platform === 'twitter' && formData.description.length > 280 && (
                <span className="text-red-400 ml-2">(exceeds Twitter limit)</span>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-2">
              Post Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all"
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
              className="flex-1 bg-[#00f0ff] text-black py-3 px-6 rounded-md font-semibold hover:bg-[#00d4e0] transition-colors shadow-[0_0_15px_#00f0ff20]"
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={() => router.push('/calendar')}
              className="px-6 py-3 border border-[#2a2a3a] rounded-md text-gray-400 hover:border-gray-500 hover:text-white transition-all"
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
