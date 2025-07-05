'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onPlay?: () => void;
  onPause?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onUnmute?: () => void;
}

/**
 * Custom hook to handle keyboard shortcuts for media playback
 * @param handlers Object containing callback handlers for different keyboard actions
 */
export default function useKeyboardShortcuts({
  onPlay,
  onPause,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onMute,
  onUnmute,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on input elements
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      
      switch (e.key) {
        case ' ':  // Space
          e.preventDefault();
          if (onPlay && onPause) {
            const audio = document.querySelector('audio');
            if (audio) {
              audio.paused ? onPlay() : onPause();
            }
          }
          break;
        case 'ArrowRight':
          if (onSeekForward) {
            e.preventDefault();
            onSeekForward();
          }
          break;
        case 'ArrowLeft':
          if (onSeekBackward) {
            e.preventDefault();
            onSeekBackward();
          }
          break;
        case 'ArrowUp':
          if (onVolumeUp) {
            e.preventDefault();
            onVolumeUp();
          }
          break;
        case 'ArrowDown':
          if (onVolumeDown) {
            e.preventDefault();
            onVolumeDown();
          }
          break;
        case 'm':
        case 'M':
          if (onMute && onUnmute) {
            const audio = document.querySelector('audio');
            if (audio) {
              audio.muted ? onUnmute() : onMute();
            }
          }
          break;
        default:
          break;
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlay, onPause, onSeekForward, onSeekBackward, onVolumeUp, onVolumeDown, onMute, onUnmute]);
}
