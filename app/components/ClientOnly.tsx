'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders its children only on the client side.
 * This helps prevent hydration mismatch errors from components that use browser APIs.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  // State to track if component is mounted on client
  const [mounted, setMounted] = useState(false);

  // Update mounted state when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    
    // Optional: Return cleanup function
    return () => setMounted(false);
  }, []);

  // If not yet mounted (server-side), render fallback or nothing
  if (!mounted) {
    return fallback;
  }

  // Once mounted (client-side), render children
  return <>{children}</>;
}
