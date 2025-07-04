declare module 'wavesurfer.js' {
  interface WaveSurferOptions {
    container: HTMLElement;
    waveColor?: string;
    progressColor?: string;
    height?: number;
    barWidth?: number;
    barGap?: number;
    responsive?: boolean;
    cursorWidth?: number;
    normalize?: boolean;
    backend?: string;
    [key: string]: any;
  }

  class WaveSurfer {
    static create(options: WaveSurferOptions): WaveSurfer;
    load(url: string): void;
    on(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(progress: number): void;
    play(start?: number, end?: number): void;
    pause(): void;
    stop(): void;
  }

  export default WaveSurfer;
}
