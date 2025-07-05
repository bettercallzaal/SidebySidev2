'use client';

import React, { useState } from 'react';

export type VisualizationMode = 'waveform' | 'spectrogram' | 'combined';

interface VisualizationSettingsProps {
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
}

export default function VisualizationSettings({ 
  mode, 
  onModeChange 
}: VisualizationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeSelection = (newMode: VisualizationMode) => {
    onModeChange(newMode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-xs text-gray-400 hover:text-white transition-colors focus:outline-none"
        aria-label="Visualization Settings"
      >
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
        </svg>
        Visualization
      </button>

      {isOpen && (
        <div className="absolute z-10 bottom-full mb-2 right-0 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-800 w-48">
          <div className="text-xs font-medium text-white mb-2">Visualization Mode</div>
          
          <div className="space-y-2">
            <button
              className={`w-full text-left px-3 py-1.5 rounded text-xs ${mode === 'waveform' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => handleModeSelection('waveform')}
            >
              Waveform
            </button>
            
            <button
              className={`w-full text-left px-3 py-1.5 rounded text-xs ${mode === 'spectrogram' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => handleModeSelection('spectrogram')}
            >
              Spectrogram
            </button>
            
            <button
              className={`w-full text-left px-3 py-1.5 rounded text-xs ${mode === 'combined' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onClick={() => handleModeSelection('combined')}
            >
              Combined View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
