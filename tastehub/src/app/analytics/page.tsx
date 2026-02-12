'use client';

import { AnalyticsDashboard } from '@/components';

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Track engagement and performance across platforms</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
