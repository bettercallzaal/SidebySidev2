# ZAO Cypher Visualizer - Farcaster Mini-App

## Overview
The ZAO Cypher Visualizer is a Farcaster Mini-App that provides an interactive audio experience for the ZAO Cypher track. This app allows users to visualize the audio waveform, see which artist is rapping at any given moment, add timestamp-anchored comments, and share specific moments with others.

## Features

- **Interactive Waveform Visualization**: Visual representation of the audio track with color-coded regions for each artist
- **Token-Gated Content**: Full track playback available only to $ZAO token holders, others get a 30-second preview
- **Artist Legend**: Color-coded list of artists with verse timestamps for easy navigation
- **Timestamp Comments**: Add and view comments anchored to specific moments in the track
- **Live Comment Updates**: Comments update in real-time via Supabase Realtime
- **Wallet Connection**: Connect your Ethereum wallet to verify $ZAO token holdings
- **Share Functionality**: Share specific timestamps via Farcaster casts with deep links
- **Offline Support**: Service worker caches assets for offline playback
- **Keyboard Shortcuts**: Space for play/pause, arrow keys for seeking
- **Analytics**: Usage tracking via PostHog

## Technical Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: TailwindCSS for responsive UI
- **Audio**: WaveSurfer.js for waveform visualization and audio playback
- **Blockchain**: Ethers.js for Ethereum wallet connection and token verification
- **Backend**: Supabase for comments storage and realtime updates
- **Authentication**: Farcaster Auth Kit for user identity
- **Analytics**: PostHog for event tracking and user behavior analysis
- **Performance**: Service worker for offline caching and performance optimization

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_POSTHOG_API_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This app is designed to be deployed as a Farcaster Mini-App. You can deploy to Vercel with the following command:

```bash
npm run build && vercel --prod
```

## Testing in Warpcast

To test your Mini-App in Warpcast:

1. Deploy your app to a public URL
2. Use the [Warpcast Frame Debugger](https://warpcast.com/~/developers/frames) to validate your implementation
3. Share your frame URL with others to test the full experience

## License

Propriety - All Rights Reserved
