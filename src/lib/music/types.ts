export type ProviderName = "YouTube" | "Spotify" | "Deezer" | "SoundCloud";

export interface TrackData {
  provider: ProviderName;
  videoId: string; // The unique ID for the provider (e.g. YouTube video ID)
  url: string;
  title: string;
  artist?: string;
  album?: string;
  cover?: string;
  duration?: string; // Formatted duration like "4:13"
  durationMs?: number;
  year?: string;
  channel?: string;
  publishedAt?: string;
}

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export interface MusicProvider {
  name: ProviderName;

  // Data methods
  search(query: string): Promise<TrackData[]>;
  getAlbum?(artist: string, track: string): Promise<string | undefined>;

  // Playback state
  getCurrentTrack(): TrackData | null;
  getState(): PlayerState;
  getProgress(): number; // In seconds
  getDuration(): number; // In seconds

  // Playback controls
  play(track: TrackData): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;

  // React/DOM bindings
  // This allows the provider to render any necessary hidden iframes/components
  renderPlayer?(): React.ReactNode;

  // Event listeners
  onStateChange(callback: (state: PlayerState) => void): () => void;
  onProgress(callback: (progress: number) => void): () => void;
  onError(callback: (error: string) => void): () => void;
}
