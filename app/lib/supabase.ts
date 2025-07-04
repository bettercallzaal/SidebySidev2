import { createClient } from '@supabase/supabase-js';
// Initialize Supabase client with environment variables
// In production, these values would come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Mock Supabase implementation for local development without actual credentials
export const supabase = {
  // Mock implementation
};

// Define comment type
export interface Comment {
  id: string;
  track_id: string;
  timestamp: number;
  user_id: string;
  text: string;
  created_at: string;
}

// Mock comment data
const mockComments: Comment[] = [
  {
    id: '1',
    track_id: 'zao-cypher-1',
    timestamp: 15,
    user_id: 'user123',
    text: 'This beat is ',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    track_id: 'zao-cypher-1',
    timestamp: 45,
    user_id: 'user456',
    text: 'Best verse incoming!',
    created_at: new Date().toISOString(),
  },
];

// Add a comment to a track
export const addComment = async (
  trackId: string, 
  timestamp: number,
  userId: string,
  text: string
): Promise<Comment | null> => {
  try {
    // Create a new mock comment
    const newComment: Comment = {
      id: `${Math.floor(Math.random() * 10000)}`,
      track_id: trackId,
      timestamp,
      user_id: userId,
      text,
      created_at: new Date().toISOString(),
    };
    
    // Add to our mock database
    mockComments.push(newComment);
    
    console.log('Added comment:', newComment);
    
    // In a real implementation, we'd emit this to subscribers
    // For our mock, we'll do it synchronously
    setTimeout(() => {
      if (mockSubscriptionCallbacks[trackId]) {
        mockSubscriptionCallbacks[trackId].forEach(callback => callback(newComment));
      }
    }, 100);
    
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Get comments for a track
export const getComments = async (trackId: string): Promise<Comment[]> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter comments for this track
    return mockComments.filter(comment => comment.track_id === trackId);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Store callbacks for mock subscriptions
const mockSubscriptionCallbacks: Record<string, ((comment: Comment) => void)[]> = {};

// Subscribe to new comments
export const subscribeToComments = (trackId: string, callback: (comment: Comment) => void) => {
  // Initialize array for this track if it doesn't exist
  if (!mockSubscriptionCallbacks[trackId]) {
    mockSubscriptionCallbacks[trackId] = [];
  }
  
  // Add callback to the array
  mockSubscriptionCallbacks[trackId].push(callback);
  
  // Return mock subscription object
  return {
    unsubscribe: () => {
      // Remove this callback from the array
      if (mockSubscriptionCallbacks[trackId]) {
        const index = mockSubscriptionCallbacks[trackId].indexOf(callback);
        if (index !== -1) {
          mockSubscriptionCallbacks[trackId].splice(index, 1);
        }
      }
    }
  };
};
