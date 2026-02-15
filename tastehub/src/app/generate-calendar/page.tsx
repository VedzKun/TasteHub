'use client';

import { useMemo, useState } from 'react';
import type { CalendarRequirements, GeneratedCalendarItem, Platform } from '@/types';

type ViewMode = 'table' | 'cards';

const ALL_PLATFORMS: Platform[] = ['instagram', 'facebook', 'twitter'];

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function buildCsv(items: GeneratedCalendarItem[]) {
  const headers = [
    'Day',
    'Date',
    'Theme',
    'Platform',
    'Post Idea',
    'Caption Draft',
    'CTA',
    'Hashtags',
    'Recommended Time',
    'Metric Focus',
    'Predicted Engagement %',
    'Model Provider',
  ];

  const rows = items.map((item) => [
    String(item.day),
    item.date,
    item.theme,
    item.platform,
    item.postIdea,
    item.captionDraft,
    item.cta,
    item.hashtags.join(' '),
    item.recommendedTime,
    item.metricFocus,
    item.predictedEngagementPercent.toFixed(2),
    item.modelProvider,
  ]);

  const csvRows = [headers, ...rows].map((row) =>
    row
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(',')
  );
  return csvRows.join('\n');
}

export default function GenerateCalendarPage() {
  const [companyName, setCompanyName] = useState('TasteHub');
  const [objective, setObjective] = useState(
    'Create a 30-day content calendar with platform-specific strategies to boost engagement and retention.'
  );
  const [days, setDays] = useState(30);
  const [platforms, setPlatforms] = useState<Platform[]>([...ALL_PLATFORMS]);
  const [followerCount, setFollowerCount] = useState(5000);
  const [requirements, setRequirements] = useState<CalendarRequirements>({
    dailyThemes: true,
    platformSpecific: true,
    analytics: true,
  });

  const [items, setItems] = useState<GeneratedCalendarItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasFallbackRows = useMemo(
    () => items.some((item) => item.modelProvider === 'heuristic-fallback'),
    [items]
  );

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) => {
      if (prev.includes(platform)) {
        const next = prev.filter((value) => value !== platform);
        return next.length > 0 ? next : prev;
      }
      return [...prev, platform];
    });
  };

  const generateCalendar = async () => {
    try {
      setError('');
      setSuccess('');
      setIsGenerating(true);

      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          objective,
          days,
          platforms,
          followerCount,
          requirements,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate calendar');
      }

      setItems(payload.items || []);
      setSuccess(`Generated ${payload.items?.length || 0} calendar days.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate calendar');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAllToPosts = async () => {
    if (items.length === 0) {
      setError('Generate a plan before saving.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsSaving(true);

      const response = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultStatus: 'scheduled',
          createCalendarEvents: true,
          items: items.map((item) => ({
            date: item.date,
            theme: item.theme,
            platform: item.platform,
            postIdea: item.postIdea,
            captionDraft: item.captionDraft,
            cta: item.cta,
            hashtags: item.hashtags,
            recommendedTime: item.recommendedTime,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to save generated posts');
      }

      setSuccess(
        `Saved ${payload.createdPosts} posts and ${payload.createdEvents} calendar events.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save generated posts');
    } finally {
      setIsSaving(false);
    }
  };

  const exportCsv = () => {
    if (items.length === 0) {
      setError('Generate a plan before exporting.');
      return;
    }

    const csv = buildCsv(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${companyName || 'content'}-30-day-calendar.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <section className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">30-Day Calendar Generator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Build a complete plan with daily themes, platform-specific strategy, and ML engagement
            scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Company Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
              placeholder="TasteHub"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Days</label>
            <input
              type="number"
              min={7}
              max={60}
              value={days}
              onChange={(e) => setDays(Math.min(60, Math.max(7, Number(e.target.value) || 30)))}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Project Objective</label>
          <textarea
            rows={4}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((platform) => {
                const active = platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-2 rounded-md border text-sm capitalize transition-colors ${
                      active
                        ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]'
                        : 'border-[#2a2a3a] text-gray-400 hover:text-white'
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Estimated Followers</label>
            <input
              type="number"
              min={0}
              value={followerCount}
              onChange={(e) => setFollowerCount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-md bg-[#0a0a0f] border border-[#2a2a3a] text-white outline-none focus:ring-1 focus:ring-[#00f0ff]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Requirements</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md px-3 py-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={requirements.dailyThemes}
                onChange={(e) =>
                  setRequirements((prev) => ({ ...prev, dailyThemes: e.target.checked }))
                }
              />
              Daily themes
            </label>
            <label className="flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md px-3 py-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={requirements.platformSpecific}
                onChange={(e) =>
                  setRequirements((prev) => ({ ...prev, platformSpecific: e.target.checked }))
                }
              />
              Platform specific
            </label>
            <label className="flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md px-3 py-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={requirements.analytics}
                onChange={(e) =>
                  setRequirements((prev) => ({ ...prev, analytics: e.target.checked }))
                }
              />
              Include analytics
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateCalendar}
            disabled={isGenerating}
            className="bg-[#00f0ff] text-black px-5 py-2 rounded-md font-semibold hover:bg-[#00d4e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate 30-Day Calendar'}
          </button>
          <button
            type="button"
            onClick={saveAllToPosts}
            disabled={isSaving || items.length === 0}
            className="border border-[#2a2a3a] text-gray-300 px-5 py-2 rounded-md hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save All to Calendar/Posts'}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={items.length === 0}
            className="border border-[#2a2a3a] text-gray-300 px-5 py-2 rounded-md hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-md px-4 py-3 text-sm">
            {success}
          </div>
        ) : null}
        {hasFallbackRows ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-md px-4 py-3 text-sm">
            Some rows used fallback scoring (`heuristic-fallback`). Install Python dependencies if
            you want full model scoring.
          </div>
        ) : null}
      </section>

      {items.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-bold text-white">Generated Plan ({items.length} days)</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm border ${
                  viewMode === 'table'
                    ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                    : 'border-[#2a2a3a] text-gray-400'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm border ${
                  viewMode === 'cards'
                    ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                    : 'border-[#2a2a3a] text-gray-400'
                }`}
              >
                Card View
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg overflow-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-[#0a0a0f] border-b border-[#2a2a3a]">
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Theme</th>
                    <th className="px-4 py-3">Idea</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Predicted %</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.day}-${item.date}`} className="border-b border-[#1e1e2e]">
                      <td className="px-4 py-3 text-gray-300">{item.day}</td>
                      <td className="px-4 py-3 text-gray-300">{formatDateLabel(item.date)}</td>
                      <td className="px-4 py-3 capitalize text-gray-300">{item.platform}</td>
                      <td className="px-4 py-3 text-white font-medium">{item.theme}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[360px]">{item.postIdea}</td>
                      <td className="px-4 py-3 text-gray-300">{item.recommendedTime}</td>
                      <td className="px-4 py-3 text-[#00ff88] font-semibold">
                        {item.predictedEngagementPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((item) => (
                <article
                  key={`${item.day}-${item.date}-card`}
                  className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Day {item.day} • {formatDateLabel(item.date)}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-gray-300 capitalize">
                      {item.platform}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-white">{item.theme}</h4>
                  <p className="text-sm text-gray-300">{item.postIdea}</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{item.captionDraft}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.hashtags.map((tag) => (
                      <span
                        key={`${item.day}-${tag}`}
                        className="text-xs bg-[#0a0a0f] border border-[#2a2a3a] rounded px-2 py-1 text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Time: {item.recommendedTime}</span>
                    <span className="text-[#00ff88] font-semibold">
                      {item.predictedEngagementPercent.toFixed(2)}%
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
