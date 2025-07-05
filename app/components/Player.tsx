'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Artist } from '../lib/artistData';
import ClientOnly from './ClientOnly';

import dynamic from 'next/dynamic';
import LoadingWave from './LoadingWave';

// Import the Waveform component only on client-side with no SSR
const DynamicWaveform = dynamic(() => import('./Waveform'), {
  ssr: false,
  loading: () => <LoadingWave />,
});

interface PlayerProps {
  audioUrl: string;
  onTimeUpdate: (time: number) => void;
  isFullTrackUnlocked: boolean;
  previewLength: number;
  currentTime: number;
  onSeek: (time: number) => void;
  artists?: Artist[];
  trackTitle?: string;
}

export const Player: React.FC<PlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  isFullTrackUnlocked,
  previewLength,
  currentTime: externalCurrentTime,
  onSeek,
  artists = [],
  trackTitle = 'Side by Side Project',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Find current artist based on playback time
  const currentArtist = useMemo(() => {
    if (!artists.length) return null;
    return artists.find(artist => 
      internalCurrentTime >= artist.startTime && internalCurrentTime < artist.endTime
    ) || null;
  }, [artists, internalCurrentTime]);

  // Format time as mm:ss
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Synchronize internal current time with external current time when it changes
  useEffect(() => {
    if (audioRef.current && Math.abs(externalCurrentTime - internalCurrentTime) > 0.5) {
      audioRef.current.currentTime = externalCurrentTime;
    }
  }, [externalCurrentTime, internalCurrentTime]);

  // Update audio element and handle events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setInternalCurrentTime(currentTime);
      onTimeUpdate(currentTime);
      
      // Update progress bar
      if (progressBarRef.current) {
        const percent = (currentTime / duration) * 100;
        progressBarRef.current.style.width = `${percent}%`;
      }

      // Stop if preview is enforced and time exceeds preview length
      if (!isFullTrackUnlocked && previewLength > 0 && currentTime >= previewLength) {
        audio.pause();
        setIsPlaying(false);
        audio.currentTime = 0;
        onTimeUpdate(0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      onTimeUpdate(0);
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setIsLoaded(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [onTimeUpdate, isFullTrackUnlocked, previewLength, duration]);

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => console.error('Error playing audio:', error));
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking when clicking on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || !isLoaded) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = duration * pos;
    
    audio.currentTime = seekTime;
    onSeek(seekTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Space - play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
      
      // Left arrow - seek back 5s
      if (e.code === 'ArrowLeft') {
        const newTime = Math.max(0, internalCurrentTime - 5);
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          onSeek(newTime);
        }
      }
      
      // Right arrow - seek forward 5s
      if (e.code === 'ArrowRight') {
        const newTime = Math.min(duration, internalCurrentTime + 5);
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          onSeek(newTime);
        }
      }
      
      // Up/down arrows - volume
      if (e.code === 'ArrowUp') {
        const newVolume = Math.min(1, volume + 0.1);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
      }
      
      if (e.code === 'ArrowDown') {
        const newVolume = Math.max(0, volume - 0.1);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [internalCurrentTime, duration, volume, togglePlayPause, onSeek]);

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg w-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{trackTitle} {!isFullTrackUnlocked && previewLength > 0 && '(Preview)'}</h2>
        {currentArtist && (
          <p className="text-sm text-white/70 p-1 rounded-md mt-1" style={{ backgroundColor: `${currentArtist.color}33` }}>
            Now Playing: <span style={{ color: currentArtist.color }}>{currentArtist.name}</span>
          </p>
        )}
        
        {/* Audio element */}
        <audio 
          ref={audioRef} 
          src={audioUrl}
          preload="metadata"
          className="hidden"
        />
        
        {/* Waveform visualization with artist timeline */}
        <div className="mb-4 mt-4 relative bg-black bg-opacity-20 rounded-lg p-2">
          <ClientOnly
            fallback={
              <div className="flex justify-center items-center h-24 bg-gray-800/30 rounded-md">
                <div className="animate-pulse text-sm text-white/70">Loading waveform visualization...</div>
              </div>
            }
          >
            <DynamicWaveform
              audioUrl={audioUrl}
              artists={artists}
              isPlaying={isPlaying}
              currentTime={internalCurrentTime}
              duration={duration}
              onSeek={(time: number) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                  onSeek(time);
                }
              }}
              waveColor="rgba(255, 255, 255, 0.3)"
              progressColor={currentArtist ? `${currentArtist.color}` : "rgba(255, 255, 255, 0.8)"}
              height={80}
              barWidth={2}
              barGap={1}
              responsive={true}
            />
          </ClientOnly>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePlayPause}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 transition-colors flex items-center justify-center w-12 h-12 shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!isLoaded}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="text-sm">
              {formatTime(internalCurrentTime)} / {isLoaded ? formatTime(duration) : '--:--'}
            </div>
          </div>
          
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <span className="text-xs">🔈</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 accent-blue-500"
            />
          </div>
        </div>
        
        {/* Artist selection */}
        {artists.length > 0 && (
          <div className="mt-6 border border-gray-700 rounded-lg p-3 bg-black bg-opacity-30">
            <h3 className="text-sm font-semibold mb-2">Featured Artists</h3>
            <div className="h-48 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {artists.map(artist => (
                  <button
                    key={artist.id}
                    className="px-2 py-2 text-xs rounded-md transition-all flex flex-col items-start"
                    style={{
                      backgroundColor: currentArtist?.id === artist.id ? artist.color : `${artist.color}33`,
                      color: currentArtist?.id === artist.id ? '#000' : '#fff'
                    }}
                    onClick={() => {
                      if (audioRef.current && isLoaded) {
                        const seekTime = artist.startTime;
                        audioRef.current.currentTime = seekTime;
                        onSeek(seekTime);
                        if (!isPlaying) togglePlayPause();
                      }
                    }}
                  >
                    <span className="font-medium truncate w-full">{artist.name}</span>
                    {artist.handle && (
                      <span className="text-[10px] opacity-80 truncate w-full">{artist.handle}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Preview notification */}
        {!isFullTrackUnlocked && previewLength > 0 && (
          <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 text-yellow-300 rounded-md text-sm">
            This is a preview. Connect to unlock the full track.
          </div>
        )}
      </div>
    </div>
  );
};
