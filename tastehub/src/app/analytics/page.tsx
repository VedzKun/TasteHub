'use client';

import { AnalyticsDashboard, MLInsightsPanel } from '@/components';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <AnalyticsDashboard />
      <MLInsightsPanel />
    </div>
  );
}
