// Farcaster mini app utility functions

// This is a simplified interface for the Farcaster auth data
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
  custody_address?: string; // The user's connected wallet
  verified?: boolean;
}

// Mock function for local development - in production this would come from the @farcaster/auth-kit
export function getCurrentUser(): FarcasterUser | null {
  // In production, this would be populated by the Farcaster auth kit
  // For now, return a mock user for development
  if (typeof window !== 'undefined' && localStorage.getItem('mock_fc_user')) {
    try {
      return JSON.parse(localStorage.getItem('mock_fc_user') || '');
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Set mock user for testing
export function setMockUser(user: FarcasterUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_fc_user', JSON.stringify(user));
  }
}

// Clear mock user
export function clearMockUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_fc_user');
  }
}

// Share a cast with timestamp
export function shareCast(text: string, timestamp?: number) {
  const baseText = text || 'Check out the ZAO Cypher!';
  const link = `${window.location.origin}${window.location.pathname}${timestamp ? `?t=${timestamp}` : ''}`;
  const castText = `${baseText}\n\n${link}`;
  
  // In a real implementation, this would use the Farcaster API to create a cast
  // For now, we'll just open a new window with the text pre-populated
  if (typeof window !== 'undefined') {
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`, '_blank');
  }
  
  return true;
}
