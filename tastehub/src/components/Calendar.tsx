'use client';

import { useState } from 'react';
import { usePosts } from '@/context/PostContext';
import { Post } from '@/types';
import PostCard from './PostCard';

export default function Calendar() {
  const { posts } = usePosts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const getPostsForDay = (day: number): Post[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter((post) => post.date === dateStr);
  };

  const formatDateString = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getPlatformColor = (platform: string): string => {
    switch (platform) {
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-600';
      case 'twitter': return 'bg-sky-400';
      default: return 'bg-gray-600';
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-[#0a0a0f]"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(day);
      const dayPosts = getPostsForDay(day);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const isSelected = selectedDate === dateStr;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
          className={`h-24 p-2 border border-[#2a2a3a] cursor-pointer transition-all duration-200 hover:bg-[#1a1a2e] ${
            isToday ? 'bg-[#1a1a2e] border-[#00f0ff]' : 'bg-[#111118]'
          } ${isSelected ? 'ring-1 ring-[#00f0ff]' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-[#00f0ff]' : 'text-gray-300'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className={`text-xs text-white px-1 py-0.5 rounded truncate ${getPlatformColor(post.platform)}`}
              >
                {post.title}
              </div>
            ))}
            {dayPosts.length > 2 && (
              <div className="text-xs text-gray-500">+{dayPosts.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedPosts = selectedDate
    ? posts.filter((post) => post.date === selectedDate)
    : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-[#111118] border border-[#2a2a3a] rounded-lg p-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a2e] rounded transition-colors"
        >
          ← Prev
        </button>
        <h2 className="text-lg font-bold text-white">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a2e] rounded transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-[#1a1a2e] border-b border-[#2a2a3a]">
          {dayNames.map((day) => (
            <div key={day} className="py-3 text-center text-gray-400 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Selected Date Posts */}
      {selectedDate && (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Posts for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {selectedPosts.length === 0 ? (
            <p className="text-gray-500">No posts scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {selectedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Platform Legend</h4>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-sm text-gray-400">Instagram</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-400">Facebook</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-sky-400"></div>
            <span className="text-sm text-gray-400">Twitter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
