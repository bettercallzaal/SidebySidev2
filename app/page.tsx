'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Player } from './components/Player';
import { ArtistLegend } from './components/ArtistLegend';
import { Comments } from './components/Comments';
import NoSSR from './components/NoSSR';
import CSROnly from './components/CSROnly';
import SocialShare from './components/SocialShare';
import { WalletConnect } from './components/WalletConnect';
import { TrackSelector } from './components/TrackSelector';
import { artists, tracks, PREVIEW_LENGTH, Track, Artist } from './lib/artistData';
import { Comment, addComment, getComments, subscribeToComments } from './lib/supabase';
import { getCurrentUser, FarcasterUser } from './lib/farcaster';
import { useRouter, useSearchParams } from 'next/navigation';
import { initializeAnalytics, trackEvent } from './lib/analytics';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for the app
  const [selectedTrackId, setSelectedTrackId] = useState('midi-punk-1'); // Default to first track
  const [isFullTrackUnlocked, setIsFullTrackUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FarcasterUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) || tracks[0],
    [selectedTrackId]
  );

  // Filter artists based on the community of the selected track
  const communityArtists = useMemo(() => {
    return artists.filter((artist: Artist) => {
      return artist.community === selectedTrack.community;
    });
  }, [artists, selectedTrack.community]);

  const currentArtist = useMemo(() => {
    return communityArtists.find(
      (artist) => currentTime >= artist.startTime && currentTime < artist.endTime
    );
  }, [currentTime, communityArtists]);

  const audioUrl = `/audio/${selectedTrack.fileName}`;

  // Initialize the app
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();
    
    // Get Farcaster user
    const user = getCurrentUser();
    if (user) setCurrentUser(user);

    // Load comments for the selected track
    const loadComments = async () => {
      const loadedComments = await getComments(selectedTrackId);
      setComments(loadedComments);
    };
    loadComments();

    // Check for timestamp in URL
    const timestampParam = searchParams.get('t');
    if (timestampParam) {
      const timestamp = parseInt(timestampParam, 10);
      if (!isNaN(timestamp)) {
        setCurrentTime(timestamp);
      }
    }
    
    // Subscribe to new comments for this track
    const subscription = subscribeToComments(selectedTrackId, (newComment) => {
      setComments((prevComments) => [...prevComments, newComment]);
    });

    // Track page view for analytics
    trackEvent('page_view', {
      page: 'side_by_side_project',
      track_id: selectedTrackId,
      user_id: user?.fid || 'anonymous',
    });

    setIsInitialized(true);

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams, selectedTrackId]);

  // Handle track selection
  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
    setCurrentTime(0); // Reset playback time when switching tracks
    
    // Track for analytics
    trackEvent('track_selected', {
      track_id: trackId,
      track_title: tracks.find(t => t.id === trackId)?.title || 'unknown',
      user_id: currentUser?.fid || 'anonymous',
    });
    
    // Load comments for the new track
    const loadComments = async () => {
      const loadedComments = await getComments(trackId);
      setComments(loadedComments);
    };
    loadComments();
  };

  // Handle wallet connection
  const handleWalletConnected = (address: string, hasTokens: boolean) => {
    setUserWalletAddress(address);
    setIsFullTrackUnlocked(hasTokens);
    
    // Track for analytics
    trackEvent('wallet_connected', {
      has_tokens: hasTokens,
      user_id: currentUser?.fid || 'anonymous',
    });
  };

  // Handle adding a comment
  const handleAddComment = async (timestamp: number, text: string) => {
    if (!currentUser) return;
    
    const userId = currentUser.username || `user-${currentUser.fid}`;
    const newComment = await addComment(selectedTrackId, timestamp, userId, text);
    
    if (newComment) {
      // Track for analytics
      trackEvent('comment_added', {
        timestamp,
        track_id: selectedTrackId,
        user_id: currentUser.fid,
      });
    }
  };

  // Handle time updates from player
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Handle seeking to a specific time
  const handleSeekToTime = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Side by Side Project</h1>
      
      <div className="mb-6">
        <TrackSelector 
          tracks={tracks} 
          selectedTrackId={selectedTrackId} 
          onTrackSelect={handleTrackSelect} 
        />
      </div>
      
      <div className="mb-6">
        <NoSSR
          fallback={
            <div className="flex justify-center items-center h-24 bg-gray-800/30 rounded-md mb-4">
              <div className="animate-pulse text-sm text-white/70">Loading audio player...</div>
            </div>
          }
        >
          <Player
            audioUrl={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            isFullTrackUnlocked={isFullTrackUnlocked}
            previewLength={PREVIEW_LENGTH}
            currentTime={currentTime}
            onSeek={handleSeekToTime}
            artists={communityArtists}
            trackTitle={selectedTrack.title}
          />
        </NoSSR>
      </div>

      <div className="mb-6">
        <ArtistLegend
          artists={communityArtists}
          currentArtistId={currentArtist?.id || null}
          onArtistClick={handleSeekToTime}
          isFullTrackUnlocked={isFullTrackUnlocked}
        />
      </div>
      
      <div className="mb-6">
        <WalletConnect onConnected={handleWalletConnected} />
      </div>

      <div className="mb-6">
        <Comments
          comments={comments}
          currentTime={currentTime}
          onTimeClick={handleSeekToTime}
          onAddComment={handleAddComment}
          isAuthenticated={!!currentUser}
        />
      </div>
      
      <div className="mb-6 mt-10">
        <h3 className="text-lg font-medium mb-3">Share this project</h3>
        <SocialShare title="Check out this awesome Side by Side Project with 30 artists!" />
      </div>

      <footer className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Side by Side Project</p>
      </footer>
    </main>
  );
}

// Wrap the entire page in CSROnly to prevent any server-side rendering
export default function Home() {
  return (
    <CSROnly
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-lg mb-2">Loading Side by Side Project...</div>
            <div className="text-sm text-gray-400">Please wait while the audio player initializes</div>
          </div>
        </div>
      }
    >
      <HomePage />
    </CSROnly>
  );
}

// End of file
