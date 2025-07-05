'use client';

import React, { useState } from 'react';

interface KeyboardShortcutProps {
  keyLabel: string;
  description: string;
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keyLabel, description }) => (
  <div className="flex items-center mb-2">
    <div className="bg-gray-800 px-2 py-1 rounded-md text-xs font-mono text-white border border-gray-700 shadow-sm min-w-[60px] text-center">
      {keyLabel}
    </div>
    <div className="ml-3 text-sm text-white/80">{description}</div>
  </div>
);

export default function KeyboardShortcutsHelp() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsVisible(!isVisible)} 
        className="text-xs flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
        aria-label="Show keyboard shortcuts"
      >
        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
        </svg>
        Keyboard Shortcuts
      </button>
      
      {isVisible && (
        <div className="absolute z-10 bottom-full mb-2 right-0 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-800 w-72">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white">Keyboard Shortcuts</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close shortcuts help"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs uppercase text-purple-400 mb-2 font-medium">Playback</h4>
              <KeyboardShortcut keyLabel="Space" description="Play / Pause" />
              <KeyboardShortcut keyLabel="←" description="Skip back 10 seconds" />
              <KeyboardShortcut keyLabel="→" description="Skip forward 10 seconds" />
              <KeyboardShortcut keyLabel="Shift + ←" description="Previous artist" />
              <KeyboardShortcut keyLabel="Shift + →" description="Next artist" />
            </div>
            
            <div>
              <h4 className="text-xs uppercase text-purple-400 mb-2 font-medium">Volume</h4>
              <KeyboardShortcut keyLabel="↑" description="Volume up" />
              <KeyboardShortcut keyLabel="↓" description="Volume down" />
              <KeyboardShortcut keyLabel="M" description="Mute / Unmute" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
