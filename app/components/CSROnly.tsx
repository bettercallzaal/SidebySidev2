'use client';

import React, { useEffect, useState } from 'react';

/**
 * CSROnly - Client Side Rendering Only component
 * 
 * This component prevents any children from rendering on the server
 * and only renders them on the client after hydration is complete.
 * Use this as a last resort to fix severe hydration mismatches.
 */
export default function CSROnly({
  children,
  fallback = <div className="min-h-screen bg-black" />
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // Track if we've mounted on the client
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    // Set mounted flag once we're on the client
    setHasMounted(true);
  }, []);
  
  // Show nothing (or fallback) during SSR and first client render
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  // Once mounted on client, render children
  return <>{children}</>;
}
