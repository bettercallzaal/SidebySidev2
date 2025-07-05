'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Artist } from '../lib/artistData';
import { VisualizationMode } from './VisualizationSettings';

// This component only runs on client-side
const isClient = typeof window !== 'undefined';

// Define wavesurfer type for TypeScript - using any to avoid issues with dynamic imports
type WavesurferType = any;

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
  visualizationMode?: VisualizationMode;
  onReady?: (duration: number) => void;
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
  responsive = true,
  visualizationMode = 'waveform',
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WavesurferType>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [hoveredArtist, setHoveredArtist] = useState<Artist | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);

  // Filter artists based on the selected track's community
  const relevantArtists = artists;

  // Find the artist at the current time
  const currentArtist = relevantArtists.find(artist =>
    currentTime >= artist.startTime && currentTime < artist.endTime
  ) || null;

  // Wavesurfer initialization effect - only runs on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

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

        // Base options for all visualization modes
        const baseOptions = {
          container: containerRef.current,
          height,
          cursorWidth: 2,
          cursorColor: '#ffffff',
          backend: 'WebAudio',
          normalize: true,
          partialRender: true,
          responsive,
          minPxPerSec: 50,
          hideScrollbar: true,
          drawingContextAttributes: {
            desynchronized: true, // Improve rendering performance
            alpha: true,
          },
        };

        // Options specific to visualization mode
        const modeOptions: Record<VisualizationMode, any> = {
          waveform: {
            waveColor,
            progressColor,
            barWidth,
            barGap,
            barRadius: 2,
          },
          spectrogram: {
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
          },
          combined: {
            waveColor: waveColor,
            progressColor: progressColor,
            barWidth,
            barGap,
            barRadius: 2,
          }
        };

        // Create the WaveSurfer instance
        const wavesurfer = WaveSurfer.create({
          ...baseOptions,
          ...modeOptions[visualizationMode],
        });

        // Load audio
        wavesurfer.load(audioUrl);

        // Add event listeners
        wavesurfer.on('ready', () => {
          setIsLoaded(true);
          if (onReady) onReady(wavesurfer.getDuration());

          // For spectrogram and combined modes, add visual enhancements
          if ((visualizationMode === 'spectrogram' || visualizationMode === 'combined') && isClient) {
            try {
              // Modern wavesurfer.js v7+ has built-in spectrogram support
              // We handle it with specialized color schemes and settings
              const gradient = containerRef.current?.querySelector('canvas')?.getContext('2d');
              if (gradient) {
                // Create a custom gradient for the visualization
                const gradientColors = gradient.createLinearGradient(0, 0, 0, height);
                gradientColors.addColorStop(0, 'rgba(200, 0, 200, 0.8)');
                gradientColors.addColorStop(0.5, 'rgba(128, 0, 128, 0.5)');
                gradientColors.addColorStop(1, 'rgba(64, 0, 64, 0.3)');
                
                // Apply the gradient to the waveform
                if (wavesurfer) {
                  // Use any type to access properties that might not be in the type definition
                  (wavesurfer as any).setOptions({ 
                    waveColor: gradientColors,
                    progressColor: visualizationMode === 'spectrogram' ? 
                      'rgba(255, 255, 255, 0.5)' : 
                      progressColor
                  });
                }
              }
            } catch (err) {
              console.error('Error with visualization enhancement:', err);
            }
          }

          // Initialize regions after audio is loaded
          try {
            // Modern wavesurfer.js uses a regions plugin or different API
            // Instead of depending on it, we'll use our custom artist timeline implementation
            // This is already well-implemented in your existing code
            // and avoids compatibility issues with different wavesurfer versions
            
            // The regions will be visually rendered by the React timeline component
            // in the return section of this component
          } catch (err) {
            console.error('Error with initialization:', err);
          }
          wavesurfer.on('click', (e: MouseEvent) => {
            if (!containerRef.current) return;
            const duration = wavesurfer.getDuration();
            const rect = containerRef.current.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            const clickTime = position * duration;
            onSeek(clickTime);
          });
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
    const initTimer = setTimeout(() => {
      initializeWaveSurfer();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) { }
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
      {/* Modern loading state - animated waveform visualization */}
      {!isLoaded && (
        <div className="flex justify-center items-center h-24 bg-gray-800/30 rounded-md mb-2">
          <div className="flex items-end space-x-1">
            {[...Array(8)].map((_, i) => {
              const height = Math.abs(Math.sin(i * 0.5) * 40) + 10;
              return (
                <div 
                  key={i}
                  className="w-2 rounded-full bg-gradient-to-t from-purple-700 to-purple-400 animate-pulse"
                  style={{
                    height: `${height}px`,
                    animationDelay: `${i * 0.07}s`,
                    animationDuration: '1.2s'
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      
      {/* Enhanced artist timeline above the waveform */}
      <div className="relative w-full h-8 mb-2 bg-gray-900/30 rounded-md overflow-hidden">
        {relevantArtists.map((artist) => (
          <div 
            key={artist.id}
            className="absolute h-full top-0 opacity-80 hover:opacity-100 cursor-pointer transition-all hover:h-[110%] hover:-top-[5%] group"
            style={{
              left: `${(artist.startTime / duration) * 100}%`,
              width: `${((artist.endTime - artist.startTime) / duration) * 100}%`,
              backgroundColor: artist.color || '#9147FF',
              borderRight: artist.endTime < duration ? '1px solid rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => onSeek(artist.startTime)}
          >
            {/* Artist name tooltip on hover */}
            <span 
              className="absolute top-full left-0 mt-1 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ whiteSpace: 'nowrap' }}
            >
              {artist.name} ({formatTime(artist.startTime)})
            </span>
          </div>
        ))}
        
        {/* Time markers */}
        {[0, 0.25, 0.5, 0.75, 1].map(position => (
          <div 
            key={position}
            className="absolute top-0 h-2 border-l border-white/30"
            style={{ left: `${position * 100}%` }}
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

      {/* Enhanced time display with current artist highlight */}
      <div className="mt-2 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-white opacity-70">{formatTime(currentTime)}</span>
          {currentArtist && (
            <span className="px-2 py-0.5 bg-purple-800/40 rounded text-xs text-purple-300 truncate max-w-[150px]" title={currentArtist.name}>
              {currentArtist.name}
            </span>
          )}
        </div>
        <div className="text-white opacity-70">{formatTime(duration)}</div>
      </div>
    </div>
  );
};

// Use a default export of the component itself for dynamic imports
export default React.memo(Waveform);
