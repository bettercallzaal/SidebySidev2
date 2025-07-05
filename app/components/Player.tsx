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
    <div className="w-full relative">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2 text-purple-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </span>
          {trackTitle}
        </h2>
        
        {/* Audio element - hidden */}
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
        
        {/* Modern Controls - Spotify Inspired */}
        <div className="flex flex-col space-y-4 mt-2">
          {/* Time indicator under waveform */}
          <div className="flex justify-between items-center text-xs text-white/70">
            <span>{formatTime(internalCurrentTime)}</span>
            <span>{isLoaded ? formatTime(duration) : '--:--'}</span>
          </div>
          
          {/* Main controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Rewind 10s */}
              <button 
                onClick={() => {
                  if (audioRef.current && isLoaded) {
                    const newTime = Math.max(0, internalCurrentTime - 10);
                    audioRef.current.currentTime = newTime;
                    onSeek(newTime);
                  }
                }}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
                aria-label="Rewind 10 seconds"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.13 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3ZM10 12V22H8V14H6V12H10ZM18 14V20C18 21.11 17.11 22 16 22H14C12.89 22 12 21.1 12 20V14C12 12.89 12.89 12 14 12H16C17.11 12 18 12.9 18 14ZM16 14H14V20H16V14Z"/>
                </svg>
              </button>
              
              {/* Play/Pause */}
              <button 
                onClick={togglePlayPause}
                className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-full p-3 transition-all flex items-center justify-center w-12 h-12 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={!isLoaded}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              {/* Forward 10s */}
              <button 
                onClick={() => {
                  if (audioRef.current && isLoaded) {
                    const newTime = Math.min(duration, internalCurrentTime + 10);
                    audioRef.current.currentTime = newTime;
                    onSeek(newTime);
                  }
                }}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
                aria-label="Forward 10 seconds"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.4 5.6C16.55 4 14.15 3 11.5 3C6.85 3 2.92 6.03 1.54 10.22L3.9 11C4.95 7.81 7.95 5.5 11.5 5.5C13.45 5.5 15.23 6.22 16.62 7.38L14 10H21V3L18.4 5.6ZM14 12V22H16V14H18V12H14ZM6 14V20C6 21.11 6.89 22 8 22H10C11.11 22 12 21.1 12 20V14C12 12.89 11.11 12 10 12H8C6.89 12 6 12.9 6 14ZM8 14H10V20H8V14Z"/>
                </svg>
              </button>
            </div>
            
            {/* Volume control with icon */}
            <div className="flex items-center space-x-2 group relative">
              <button 
                onClick={() => {
                  if (volume > 0) {
                    setVolume(0);
                    if (audioRef.current) audioRef.current.volume = 0;
                  } else {
                    setVolume(0.8);
                    if (audioRef.current) audioRef.current.volume = 0.8;
                  }
                }}
                className="text-white/80 hover:text-white transition-colors p-1 focus:outline-none"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              >
                {volume === 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.63 3.63c-.39.39-.39 1.02 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                  </svg>
                )}
              </button>
              
              <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden hidden group-hover:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[110%]">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-full opacity-0 absolute cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern Artist selection with improved UI */}
        {artists.length > 0 && (
          <div className="mt-6 rounded-lg p-4 bg-gradient-to-b from-gray-900/80 to-black/70 shadow-lg">
            <h3 className="text-sm font-semibold mb-3 text-white/90 flex items-center">
              <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Featured Artists
            </h3>
            <div className="h-52 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {artists.map(artist => {
                  const isActive = currentArtist?.id === artist.id;
                  return (
                    <button
                      key={artist.id}
                      className={`px-3 py-2.5 text-xs rounded-md transition-all flex flex-col items-start focus:outline-none ${isActive ? 'ring-2 ring-white/30' : 'hover:bg-white/10'}`}
                      style={{
                        backgroundColor: isActive ? artist.color || '#9147FF' : `${artist.color || '#9147FF'}20`,
                        color: isActive ? '#000' : '#fff'
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
                      <div className="w-full h-0.5 bg-white/20 mt-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/70 rounded-full"
                          style={{ 
                            width: `${isActive ? ((internalCurrentTime - artist.startTime) / (artist.endTime - artist.startTime)) * 100 : 0}%`,
                            opacity: isActive ? 1 : 0,
                            transition: 'width 0.2s, opacity 0.3s'
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Preview notification */}
        {!isFullTrackUnlocked && previewLength > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 rounded-md shadow-inner border border-yellow-500/10 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="mr-2 text-yellow-400" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-sm text-yellow-300 font-medium">Preview mode. Connect your wallet to unlock the full track.</span>
            </div>
            <div className="w-full bg-yellow-500/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-yellow-400/70 h-full rounded-full"
                style={{ width: `${(previewLength / duration) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
