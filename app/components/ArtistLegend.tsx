import React from 'react';
import { Artist } from '../lib/artistData';

interface ArtistLegendProps {
  artists: Artist[];
  currentArtistId: string | null;
  isFullTrackUnlocked: boolean;
  onArtistClick: (time: number) => void;
}

export const ArtistLegend: React.FC<ArtistLegendProps> = ({
  artists,
  currentArtistId,
  isFullTrackUnlocked,
  onArtistClick,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-black bg-opacity-90 text-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Artists</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {artists.map((artist) => {
          const isDisabled = !isFullTrackUnlocked && artist.startTime >= 30;
          const isActive = artist.id === currentArtistId;
          
          return (
            <button
              key={artist.id}
              onClick={() => !isDisabled && onArtistClick(artist.startTime)}
              disabled={isDisabled}
              className={`
                text-left px-3 py-2 rounded-md text-sm font-medium 
                transition-all duration-200
                ${isActive ? 'ring-2' : ''}
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-opacity-30 cursor-pointer'
                }
              `}
              style={{ 
                backgroundColor: `${artist.color}22`,
                borderLeft: `4px solid ${artist.color}`,
              }}
            >
              <span className="block truncate">{artist.name}</span>
              <span className="text-xs text-gray-400">
                {formatTime(artist.startTime)}
                {isDisabled && ' (Locked)'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to format time as mm:ss
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
