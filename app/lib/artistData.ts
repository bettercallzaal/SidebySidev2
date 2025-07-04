// Artist data for the Side by Side project visualizer

// Define the Track interface
export interface Track {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  duration: number; // in seconds
}

// Define the Artist interface for verse sections
export interface Artist {
  id: string;
  name: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  color: string; // CSS color
  handle?: string; // Twitter/Farcaster handle
  community?: 'midipunkz' | 'zao';
}

// Available tracks
export const tracks: Track[] = [
  {
    id: 'midi-punk-1',
    title: 'MIDI VERSION',
    artist: 'MidipunkZ',
    fileName: 'ZAO MiDiPunkz MIDI VERSION MIX1.mp3',
    duration: 210, // Estimated duration in seconds
    community: 'midipunkz'
  },
  {
    id: 'midi-punk-2',
    title: 'ZAO VERSION',
    artist: 'ZAO',
    fileName: 'ZAO MiDiPunkz ZAO VERSION MIX2.mp3',
    duration: 190, // Estimated duration in seconds
    community: 'zao'
  }
];

// Update Track interface to include community
export interface Track {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  duration: number; // in seconds
  community?: 'midipunkz' | 'zao';
}

// Generate a random pastel color for each artist
function generatePastelColor(seed: number): string {
  // Use seed to generate consistent colors per artist
  const hue = (seed * 137.5) % 360;
  return `hsl(${hue}, 70%, 80%)`;
}

// Contributors for the MidipunkZ track
export const midipunkzArtists: Artist[] = [
  { id: '1', name: 'tkfmide', handle: '@tkfmide', startTime: 0, endTime: 13, color: generatePastelColor(1), community: 'midipunkz' },
  { id: '2', name: 'Sir_Cut_Em_Up', handle: '@Sir_Cut_Em_Up', startTime: 13, endTime: 68, color: generatePastelColor(2), community: 'midipunkz' },
  { id: '3', name: 'Vans_Cmkro', handle: '@Vans_Cmkro', startTime: 68, endTime: 71, color: generatePastelColor(3), community: 'midipunkz' },
  { id: '4', name: 'Ramadzo', handle: '@_Ramadzo', startTime: 71, endTime: 75, color: generatePastelColor(4), community: 'midipunkz' },
  { id: '5', name: 'Neverroninn', handle: '@Neverroninn_', startTime: 75, endTime: 77, color: generatePastelColor(5), community: 'midipunkz' },
  { id: '6', name: 'flokdex', handle: '@flokdex', startTime: 77, endTime: 78, color: generatePastelColor(6), community: 'midipunkz' },
  { id: '7', name: 'tch567', handle: '@tch567', startTime: 78, endTime: 79, color: generatePastelColor(7), community: 'midipunkz' },
  { id: '8', name: 'ShaneTWalker', handle: '@ShaneTWalker', startTime: 79, endTime: 82, color: generatePastelColor(8), community: 'midipunkz' },
  { id: '9', name: 'TeraBitcoins', handle: '@TeraBitcoins', startTime: 82, endTime: 83, color: generatePastelColor(9), community: 'midipunkz' },
  { id: '10', name: 'Lord_iiiip', handle: '@Lord_iiiip', startTime: 83, endTime: 84, color: generatePastelColor(10), community: 'midipunkz' },
  { id: '11', name: 'Finderfound', handle: '@Finderfound', startTime: 84, endTime: 85, color: generatePastelColor(11), community: 'midipunkz' },
  { id: '12', name: 'iraxlab', handle: '@iraxlab', startTime: 85, endTime: 87, color: generatePastelColor(12), community: 'midipunkz' },
  { id: '13', name: 'SketchLight_ray', handle: '@SketchLight_ray', startTime: 87, endTime: 89, color: generatePastelColor(13), community: 'midipunkz' },
  { id: '14', name: 'ebabur_art', handle: '@ebabur_art', startTime: 89, endTime: 116, color: generatePastelColor(14), community: 'midipunkz' },
  { id: '15', name: 'PrizemArtNft', handle: '@PrizemArtNft', startTime: 116, endTime: 125, color: generatePastelColor(15), community: 'midipunkz' },
  { id: '16', name: 'Davc_s', handle: '@Davc_s', startTime: 125, endTime: 127, color: generatePastelColor(16), community: 'midipunkz' },
  { id: '17', name: 'DorkLovesSports', handle: '@DorkLovesSports', startTime: 127, endTime: 130, color: generatePastelColor(17), community: 'midipunkz' },
  { id: '18', name: 'LMDesigns8', handle: '@LMDesigns8', startTime: 130, endTime: 137, color: generatePastelColor(18), community: 'midipunkz' },
  { id: '19', name: 'KremBeats', handle: '@KremBeats', startTime: 137, endTime: 155, color: generatePastelColor(19), community: 'midipunkz' },
  { id: '20', name: 'StoopidPenguin', handle: '@StoopidPenguin_', startTime: 155, endTime: 156, color: generatePastelColor(20), community: 'midipunkz' },
  { id: '21', name: 'David_Doran', handle: '@_David_Doran', startTime: 156, endTime: 194, color: generatePastelColor(21), community: 'midipunkz' },
  { id: '22', name: 'Visheh', handle: '@Visheh_xyz', startTime: 194, endTime: 210, color: generatePastelColor(22), community: 'midipunkz' }
];

// Contributors for the ZAO track (placeholder - replace with actual contributors)
export const zaoArtists: Artist[] = [
  { id: 'zao1', name: 'ZAO Artist 1', startTime: 0, endTime: 35, color: '#FF5252', community: 'zao' },
  { id: 'zao2', name: 'ZAO Artist 2', startTime: 35, endTime: 70, color: '#2196F3', community: 'zao' },
  { id: 'zao3', name: 'ZAO Artist 3', startTime: 70, endTime: 105, color: '#4CAF50', community: 'zao' },
  { id: 'zao4', name: 'ZAO Artist 4', startTime: 105, endTime: 140, color: '#FF9800', community: 'zao' },
  { id: 'zao5', name: 'ZAO Artist 5', startTime: 140, endTime: 190, color: '#9C27B0', community: 'zao' }
];

// All artists combined
export const artists: Artist[] = [...midipunkzArtists, ...zaoArtists];

// Constants for the application
export const PREVIEW_LENGTH = 60; // in seconds

// Ethereum contract details - replace with actual contract if implementing token gating
export const ZAO_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
export const MIN_TOKEN_BALANCE = 1;
