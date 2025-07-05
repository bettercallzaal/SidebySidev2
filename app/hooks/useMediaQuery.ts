'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to handle responsive design with media queries
 * @param query CSS media query string
 * @returns boolean indicating if the query matches
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Initial check
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    // Add listener for changes
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    // Clean up
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
