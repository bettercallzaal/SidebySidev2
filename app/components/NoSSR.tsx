'use client';

import { useEffect, useState } from 'react';

export default function NoSSR({ 
  children,
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // State to track if we're in the browser
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If we're still on the server, render nothing or fallback
  if (!isMounted) {
    return fallback;
  }

  // On the client, render children
  return <>{children}</>;
}
