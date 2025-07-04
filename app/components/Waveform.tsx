'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Artist } from '../lib/artistData';

// This component only runs on client-side
const isClient = typeof window !== 'undefined';

interface WaveformProps {
  audioUrl: string;
  artists: Artist[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  waveColor?: string;
  progressColor?: string;
  height?: number;
  barWidth?: number;
  barGap?: number;
  responsive?: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  artists,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  waveColor = 'rgba(255, 255, 255, 0.3)',
  progressColor = 'rgba(255, 255, 255, 0.8)',
  height = 80,
  barWidth = 2,
  barGap = 1,
  responsive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null); // Using any since WaveSurfer is dynamically imported
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [hoveredArtist, setHoveredArtist] = useState<Artist | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);

  // Filter artists based on the selected track's community
  const relevantArtists = useMemo(() => {
    if (!artists || artists.length === 0) return [];
    return artists;
  }, [artists]);

  // Find the artist at the current time
  const currentArtist = useMemo(() => {
    if (!relevantArtists.length) return null;
    return relevantArtists.find(artist => 
      currentTime >= artist.startTime && currentTime < artist.endTime
    ) || null;
  }, [currentTime, relevantArtists]);

  // Wavesurfer initialization effect - only runs on client side
  useEffect(() => {
    // Skip effect entirely on server-side
    if (typeof window === 'undefined') return;
    
    let isMounted = true;
    let initTimer: ReturnType<typeof setTimeout>;
    
    const initializeWaveSurfer = async () => {
      try {
        if (!containerRef.current || !isMounted) return;
        setIsLoaded(false);
        
        // Destroy any existing instance first
        if (wavesurferRef.current) {
          try {
            wavesurferRef.current.destroy();
          } catch (e) {
            console.error('Error destroying previous wavesurfer instance:', e);
          }
          wavesurferRef.current = null;
        }
        
        // Dynamically import WaveSurfer
        const WaveSurferModule = await import('wavesurfer.js');
        if (!isMounted || !containerRef.current) return;
        
        const WaveSurfer = WaveSurferModule.default;
        if (!WaveSurfer || !containerRef.current) return;
        
        // Initialize WaveSurfer
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor,
          progressColor,
          height,
          barWidth,
          barGap,
          responsive,
          cursorWidth: 0,
          backend: 'MediaElement',
          normalize: true,
          partialRender: true,
          minPxPerSec: 50,
          hideScrollbar: true,
          // Explicitly set values to avoid undefined
          autoplay: false,
          interact: true
        });
        
        if (!isMounted) {
          try {
            wavesurfer.destroy();
          } catch (e) {}
          return;
        }
        
        // Setup listeners before loading to catch all events
        wavesurfer.on('ready', () => {
          if (!isMounted) return;
          
          // Set loaded state
          setIsLoaded(true);
          
          // Only seek if we have valid values
          if (currentTime > 0 && duration > 0 && wavesurfer && typeof wavesurfer.seekTo === 'function') {
            try {
              const position = Math.min(currentTime / Math.max(duration, 1), 1);
              wavesurfer.seekTo(position);
            } catch (err) {
              console.error('Error seeking to position:', err);
            }
          }
        });
        
        wavesurfer.on('error', (err) => {
          console.error('WaveSurfer error:', err);
        });
        
        // Store reference and then load audio
        wavesurferRef.current = wavesurfer;
        
        // Load the audio with a try-catch
        try {
          wavesurfer.load(audioUrl);
        } catch (e) {
          console.error('Error loading audio in wavesurfer:', e);
        }
        
      } catch (error) {
        console.error('Error initializing wavesurfer:', error);
        setIsLoaded(true); // Set to true even on error to hide loading state
      }
    };
    
    // Delay initialization slightly to ensure DOM is ready
    initTimer = setTimeout(() => {
      initializeWaveSurfer();
    }, 300); // Longer delay for more reliable initialization
    
    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      
      // Clean up wavesurfer instance
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (err) {
          console.error('Error destroying wavesurfer instance:', err);
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, waveColor, progressColor, height, barWidth, barGap, responsive]);

  // Update the waveform progress when currentTime changes
  useEffect(() => {
    // Only attempt to update if waveform is loaded and initialized
    if (wavesurferRef.current && isLoaded && duration > 0) {
      try {
        // Get current waveform time safely with null checks
        const wavesurferTime = wavesurferRef.current && typeof wavesurferRef.current.getCurrentTime === 'function' ? 
          wavesurferRef.current.getCurrentTime() : 0;
        
        // Only update if the difference is more than 0.5 seconds to avoid jumps
        if (Math.abs(currentTime - wavesurferTime) > 0.5) {
          // Safely seek with null checks
          if (wavesurferRef.current && typeof wavesurferRef.current.seekTo === 'function') {
            wavesurferRef.current.seekTo(currentTime / duration);
          }
        }
      } catch (err) {
        console.error('Error updating waveform position:', err);
      }
    }
  }, [currentTime, duration, isLoaded]);

  // Handle play/pause
  useEffect(() => {
    if (!wavesurferRef.current || !isLoaded) return;
    
    if (isPlaying) {
      // Prevent actual playback as we're using the audio element for that
      // Just update visuals
    } else {
      // Just update visuals
    }
  }, [isPlaying, isLoaded]);

  // Handle mouse movement for hover tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isLoaded || !duration) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = x / rect.width;
    const hoverTime = relativeX * duration;
    
    // Update hover time and tooltip position
    setHoveredTime(hoverTime);
    setTooltipPosition({
      x: Math.min(Math.max(x, 50), rect.width - 50), // Keep tooltip within container
      y: rect.top
    });
    
    // Find the artist at hover time
    const artist = relevantArtists.find(
      a => hoverTime >= a.startTime && hoverTime < a.endTime
    ) || null;
    setHoveredArtist(artist);
  };

  // Format time as mm:ss
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full">
      {/* Loading state */}
      {!isLoaded && (
        <div className="flex justify-center items-center h-24 bg-gray-800/30 rounded-md mb-2">
          <div className="animate-pulse text-sm text-white/70">Loading waveform...</div>
        </div>
      )}
      
      {/* Artist timeline above the waveform */}
      <div className="relative w-full h-5 mb-1">
        {relevantArtists.map((artist) => (
          <div 
            key={artist.id}
            className="absolute h-5 top-0 opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
            style={{
              left: `${(artist.startTime / duration) * 100}%`,
              width: `${((artist.endTime - artist.startTime) / duration) * 100}%`,
              backgroundColor: artist.color,
              borderRight: artist.endTime < duration ? '1px solid rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => onSeek(artist.startTime)}
            title={`${artist.name} (${formatTime(artist.startTime)})`}
          />
        ))}
      </div>

      {/* Waveform container */}
      <div 
        ref={containerRef} 
        className="w-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setMouseInside(true)}
        onMouseLeave={() => setMouseInside(false)}
        onClick={(e) => {
          if (!containerRef.current || !isLoaded || !duration) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const relativeX = x / rect.width;
          const seekTime = relativeX * duration;
          onSeek(seekTime);
        }}
      />

      {/* Current time indicator line */}
      <div 
        className="absolute top-0 w-[2px] bg-white pointer-events-none"
        style={{ 
          left: `${(currentTime / duration) * 100}%`,
          height: `${height + 5}px`,
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      />

      {/* Hover tooltip */}
      {mouseInside && hoveredTime !== null && hoveredArtist && (
        <div 
          className="absolute -top-20 transform -translate-x-1/2 bg-black bg-opacity-70 p-2 rounded-md text-white text-xs z-50"
          style={{ 
            left: `${tooltipPosition.x}px`,
            minWidth: '120px'
          }}
        >
          <div className="font-bold">{hoveredArtist.name}</div>
          {hoveredArtist.handle && <div>{hoveredArtist.handle}</div>}
          <div>{formatTime(hoveredTime)}</div>
        </div>
      )}

      {/* Current artist display below waveform */}
      <div className="mt-2 flex justify-between text-xs text-white opacity-70">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>
    </div>
  );
};

// Use a default export of the component itself for dynamic imports
export default Waveform;
