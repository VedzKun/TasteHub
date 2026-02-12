'use client';

import { PostForm } from '@/components';

export default function AddPostPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create New Post</h1>
        <p className="text-gray-500 mt-1">Schedule content for your social media platforms</p>
      </div>
      <PostForm />
    </div>
  );
}
