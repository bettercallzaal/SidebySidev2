'use client';

import React from 'react';

/**
 * A beautiful animated loading indicator for audio waveforms
 * with a modern Spotify-inspired design
 */
export default function LoadingWave() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-8 px-4">
      <div className="flex items-end space-x-1 h-20 mb-3">
        {[...Array(12)].map((_, i) => {
          // Create a wave-like pattern with varying heights
          const heightPattern = [
            0.4, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.5, 0.7, 0.9, 0.8, 0.6
          ];
          const height = heightPattern[i % heightPattern.length];
          
          return (
            <div 
              key={i}
              className="w-1.5 rounded-full"
              style={{
                height: `${height * 100}%`,
                background: `linear-gradient(to top, rgb(145, 71, 255) ${height * 100}%, rgba(145, 71, 255, 0.3))`,
                animation: `loadingWaveAnim 1.2s ease-in-out infinite ${i * 0.08}s`,
                opacity: 0.6 + (height * 0.4)
              }}
            />
          );
        })}
      </div>
      
      <div className="flex items-center text-sm text-white/70">
        <svg className="mr-2 text-purple-400 animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4V2C6.5 2 2 6.5 2 12h2c0-4.4 3.6-8 8-8zm0 16c-4.4 0-8-3.6-8-8H2c0 5.5 4.5 10 10 10v-2zm8-8c0 4.4-3.6 8-8 8v2c5.5 0 10-4.5 10-10h-2zm-8-8c4.4 0 8 3.6 8 8h2c0-5.5-4.5-10-10-10v2z"/>
        </svg>
        Loading audio visualization
      </div>
      
      <style jsx global>{`
        @keyframes loadingWaveAnim {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
