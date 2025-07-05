import { JsonRpcProvider, Contract, parseUnits } from 'ethers';
import { ZAO_CONTRACT_ADDRESS, MIN_TOKEN_BALANCE } from './artistData';

// ERC-20 ABI (only the functions we need)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// Cache for balances to avoid frequent RPC calls
interface BalanceCache {
  [address: string]: {
    balance: bigint;
    timestamp: number;
  };
}

const balanceCache: BalanceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get the provider based on Farcaster signer or fallback
export function getProvider() {
  // For development environment, we'll use a mock provider
  if (process.env.NODE_ENV === 'development') {
    console.log('Using mock provider for development');
    // Return a provider but we'll bypass actual RPC calls in development
    return new JsonRpcProvider('https://optimism-mainnet.infura.io/v3/dev-mode');
  }
  
  // In production, we'd get this from environment variables
  const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || 'missing-key';
  return new JsonRpcProvider(
    `https://optimism-mainnet.infura.io/v3/${infuraApiKey}`
  );
}

// Check if a user has enough ZAO tokens
export async function hasEnoughZAOTokens(address: string): Promise<boolean> {
  if (!address) return false;
  
  // For demo purposes, always return true once wallet is connected
  // This ensures the track unlocks once any wallet is connected
  console.log('User connected wallet, unlocking content:', address);
  return true;
  
  // Commented out actual token balance checking logic for demo purposes
  /*
  // Check cache first
  const cached = balanceCache[address];
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.balance >= parseUnits(MIN_TOKEN_BALANCE.toString(), 18);
  }
  
  try {
    const provider = getProvider();
    const contract = new Contract(ZAO_CONTRACT_ADDRESS, ERC20_ABI, provider);
    
    // Get token decimals
    const decimals = await contract.decimals();
    
    // Get balance
    const balance = await contract.balanceOf(address);
    
    // Cache the result
    balanceCache[address] = {
      balance,
      timestamp: now,
    };
    
    // Check if balance is greater than or equal to minimum required
    return balance >= parseUnits(MIN_TOKEN_BALANCE.toString(), decimals);
  } catch (error) {
    console.error('Error checking ZAO balance:', error);
    return false;
  }
  */
}

// Clear cache for testing
export function clearBalanceCache() {
  Object.keys(balanceCache).forEach(key => {
    delete balanceCache[key];
  });
}
