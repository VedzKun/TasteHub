'use client';

import { Platform, platformStrategies } from '@/types';

interface PlatformSuggestionsProps {
  platform: Platform;
}

export default function PlatformSuggestions({ platform }: PlatformSuggestionsProps) {
  const strategy = platformStrategies[platform];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-6">
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${strategy.color}20` }}
        >
          {strategy.icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Tips
          </h3>
          <p className="text-sm text-gray-500">Platform-specific suggestions</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Content Ideas</h4>
        <ul className="space-y-2">
          {strategy.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-sm text-gray-600">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Best Practices</h4>
        <ul className="space-y-2">
          {strategy.bestPractices.map((practice, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-orange-500 mt-0.5">💡</span>
              <span className="text-sm text-gray-600">{practice}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          Platform-specific strategy tips based on industry best practices
        </div>
      </div>
    </div>
  );
}
