'use client';

import React from 'react';

interface SocialShareProps {
  title: string;
  url?: string;
}

/**
 * Social sharing component for easily sharing content to Twitter, Facebook, etc.
 */
export default function SocialShare({ title, url = window.location.href }: SocialShareProps) {
  const shareTitle = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch((error) => console.log('Error sharing:', error));
    }
  };

  return (
    <div className="flex items-center gap-3 my-4">
      <span className="text-sm text-gray-400">Share:</span>
      
      {/* Twitter/X Share */}
      <a 
        href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-blue-400 transition-colors"
        aria-label="Share on Twitter/X"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
        </svg>
      </a>
      
      {/* Facebook Share */}
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-blue-600 transition-colors"
        aria-label="Share on Facebook"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
      </a>
      
      {/* Native Share (Mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleShare}
          className="text-white hover:text-purple-400 transition-colors"
          aria-label="Share via native share"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
