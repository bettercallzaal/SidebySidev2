import React, { useState } from 'react';
import { hasEnoughZAOTokens } from '../lib/blockchain';

interface WalletConnectProps {
  onConnected: (address: string, hasTokens: boolean) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet and check for ZAO tokens
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet detected. Please install MetaMask or another web3 wallet.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked.');
      }
      
      const address = accounts[0];
      
      // Check for ZAO token balance
      const hasTokens = await hasEnoughZAOTokens(address);
      
      // Notify parent component
      onConnected(address, hasTokens);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-black bg-opacity-90 text-white rounded-lg p-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Unlock Full Track</h3>
      
      <p className="text-gray-300 mb-6">
        Connect your wallet to verify your $ZAO tokens and unlock the complete 30-artist cypher.
      </p>
      
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-[#9147FF] hover:bg-[#8134f0] text-white py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <p className="mt-6 text-xs text-gray-400">
        * Requires at least 1 $ZAO token on Optimism (0x34cE...)
      </p>
    </div>
  );
};

// Add TypeScript type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
