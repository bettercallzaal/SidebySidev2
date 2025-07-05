'use client';

import React from 'react';

/**
 * A beautiful animated loading indicator for audio waveforms
 */
export default function LoadingWave() {
  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="w-2 h-12 bg-purple-500 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
              opacity: 0.7 + (i * 0.06)
            }}
          />
        ))}
      </div>
      <div className="ml-4 text-sm text-gray-400">Loading audio visualization...</div>
    </div>
  );
}
