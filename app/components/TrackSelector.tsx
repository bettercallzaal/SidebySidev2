'use client';

import { useState } from 'react';
import { Track } from '../lib/artistData';
import Image from 'next/image';

interface TrackSelectorProps {
  tracks: Track[];
  selectedTrackId: string;
  onTrackSelect: (trackId: string) => void;
}

export function TrackSelector({ tracks, selectedTrackId, onTrackSelect }: TrackSelectorProps) {
  // Group tracks by community
  const midipunkzTracks = tracks.filter(track => track.community === 'midipunkz');
  const zaoTracks = tracks.filter(track => track.community === 'zao');
  
  return (
    <div className="mb-6 w-full">
      <h2 className="text-lg font-semibold mb-4 text-white">Select Track</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MidipunkZ Community */}
        <div className="border border-blue-400/30 rounded-xl p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/10">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-blue-900">MP</span>
            </div>
            <h3 className="text-md font-semibold text-blue-200">MidipunkZ Community</h3>
          </div>
          
          <div className="space-y-2">
            {midipunkzTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => onTrackSelect(track.id)}
                className={`w-full px-4 py-3 rounded-lg text-left transition flex items-center ${
                  track.id === selectedTrackId
                    ? 'bg-blue-600/80 text-white ring-2 ring-blue-400'
                    : 'bg-blue-800/20 text-gray-200 hover:bg-blue-700/30'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-sm opacity-80">{track.artist}</div>
                </div>
                {track.id === selectedTrackId && (
                  <span className="text-xl">▶️</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ZAO Community */}
        <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/10">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-purple-900">ZAO</span>
            </div>
            <h3 className="text-md font-semibold text-purple-200">ZAO Community</h3>
          </div>
          
          <div className="space-y-2">
            {zaoTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => onTrackSelect(track.id)}
                className={`w-full px-4 py-3 rounded-lg text-left transition flex items-center ${
                  track.id === selectedTrackId
                    ? 'bg-purple-600/80 text-white ring-2 ring-purple-400'
                    : 'bg-purple-800/20 text-gray-200 hover:bg-purple-700/30'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-sm opacity-80">{track.artist}</div>
                </div>
                {track.id === selectedTrackId && (
                  <span className="text-xl">▶️</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
