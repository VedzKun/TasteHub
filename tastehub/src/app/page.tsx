'use client';

import { Calendar } from '@/components';

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Content Calendar</h1>
        <p className="text-gray-500 mt-1">Plan and schedule your social media posts</p>
      </div>
      <Calendar />
    </div>
  );
}
