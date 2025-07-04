import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import { Artist, PREVIEW_LENGTH } from '../lib/artistData';

interface UseWaveSurferProps {
  containerRef: React.RefObject<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement>;
  audioUrl: string;
  artists: Artist[];
  isFullTrackUnlocked: boolean;
}

export const useWaveSurfer = ({
  containerRef,
  timelineRef,
  audioUrl,
  artists,
  isFullTrackUnlocked,
}: UseWaveSurferProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !timelineRef.current || !audioUrl) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#A8A8A8',
      progressColor: '#4B4B4B',
      cursorColor: '#FF0000',
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
    });

    // Create regions plugin
    const regions = wavesurfer.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    // Create timeline plugin
    wavesurfer.registerPlugin(
      TimelinePlugin.create({
        container: timelineRef.current,
      })
    );

    // Load audio
    wavesurfer.load(audioUrl);

    // Set up event handlers
    wavesurfer.on('ready', () => {
      wavesurferRef.current = wavesurfer;
      const fullDuration = wavesurfer.getDuration();
      
      // If not unlocked, limit to preview length
      if (!isFullTrackUnlocked) {
        wavesurfer.setOptions({
          maxCanvasWidth: (PREVIEW_LENGTH / fullDuration) * wavesurfer.getWrapper().clientWidth,
        });
      }
      
      setDuration(isFullTrackUnlocked ? fullDuration : Math.min(fullDuration, PREVIEW_LENGTH));
      
      // Create artist regions
      artists.forEach((artist) => {
        // Only create regions that are within the preview if not unlocked
        if (!isFullTrackUnlocked && artist.startTime >= PREVIEW_LENGTH) return;
        
        const end = isFullTrackUnlocked ? artist.endTime : Math.min(artist.endTime, PREVIEW_LENGTH);
        
        regions.addRegion({
          id: artist.id,
          start: artist.startTime,
          end: end,
          color: `${artist.color}33`, // Adding transparency
          data: { artist },
        });
      });
      
      setIsReady(true);
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
      
      // Find current artist based on time
      const artist = artists.find(
        (a) => time >= a.startTime && time < a.endTime
      );
      setCurrentArtist(artist || null);
      
      // Stop playback at preview limit if not unlocked
      if (!isFullTrackUnlocked && time >= PREVIEW_LENGTH) {
        wavesurfer.pause();
        wavesurfer.seekTo(PREVIEW_LENGTH / wavesurfer.getDuration());
      }
    });

    // Handle region click for seeking
    regions.on('region-clicked', (region) => {
      const artist = region.data.artist;
      if (artist) {
        wavesurfer.seekTo(artist.startTime / wavesurfer.getDuration());
        if (!isPlaying) {
          wavesurfer.play();
        }
      }
    });

    // Clean up
    return () => {
      wavesurfer.destroy();
    };
  }, [containerRef, timelineRef, audioUrl, artists, isFullTrackUnlocked]);

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  // Seek to specific time
  const seekTo = (time: number) => {
    if (!wavesurferRef.current) return;
    const normalizedTime = time / duration;
    wavesurferRef.current.seekTo(normalizedTime);
  };

  // Seek to artist's verse
  const seekToArtist = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    if (!artist || !wavesurferRef.current) return;
    
    // Don't allow seeking beyond preview if not unlocked
    if (!isFullTrackUnlocked && artist.startTime >= PREVIEW_LENGTH) {
      return;
    }
    
    const normalizedTime = artist.startTime / wavesurferRef.current.getDuration();
    wavesurferRef.current.seekTo(normalizedTime);
    
    if (!isPlaying) {
      wavesurferRef.current.play();
    }
  };

  // Set volume
  const setVolume = (volume: number) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setVolume(volume);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    currentArtist,
    isReady,
    togglePlayPause,
    seekTo,
    seekToArtist,
    setVolume,
  };
};
