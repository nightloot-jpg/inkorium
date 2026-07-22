import React, { useEffect, useRef, useState, useCallback } from "react";
import YouTube, { YouTubePlayer, YouTubeProps } from "react-youtube";
import { MusicProvider, TrackData, PlayerState, ProviderName } from "./types";
import { searchYoutubeFn, cleanYoutubeTitle } from "../youtube";

// Expose a class that implements MusicProvider, but coordinates with a React component
export class YouTubeProviderClass implements MusicProvider {
  name: ProviderName = "YouTube";

  private currentTrack: TrackData | null = null;
  private state: PlayerState = "idle";
  private progress: number = 0;
  private duration: number = 0;

  // React player ref
  private playerInstance: YouTubePlayer | null = null;

  // Callbacks
  private stateCallbacks: Set<(state: PlayerState) => void> = new Set();
  private progressCallbacks: Set<(progress: number) => void> = new Set();
  private errorCallbacks: Set<(error: string) => void> = new Set();

  private progressInterval: NodeJS.Timeout | null = null;

  async search(query: string): Promise<TrackData[]> {
    try {
      const data = await searchYoutubeFn({ data: query });
      if (!data.results) return [];

      return data.results.map(
        (item: { id: string; title: string; artist: string; cover: string; duration: string }) => ({
          provider: "YouTube",
          videoId: item.id,
          url: `https://www.youtube.com/watch?v=${item.id}`,
          title: item.title,
          artist: item.artist, // using channel as artist for now
          channel: item.artist,
          cover: item.cover,
          duration: item.duration,
        }),
      );
    } catch (e) {
      console.error("YouTube search error:", e);
      return [];
    }
  }

  // We can enrich with MusicBrainz if needed
  async enrichTrackData(track: TrackData): Promise<TrackData> {
    const enriched = { ...track };
    try {
      if (track.title && track.artist) {
        const query = encodeURIComponent(`recording:"${track.title}" AND artist:"${track.artist}"`);
        const mbRes = await fetch(`https://musicbrainz.org/ws/2/recording?query=${query}&fmt=json`);
        if (mbRes.ok) {
          const mbData = await mbRes.json();
          if (mbData.recordings && mbData.recordings.length > 0) {
            const recording = mbData.recordings[0];
            if (recording.releases && recording.releases.length > 0) {
              const release = recording.releases[0];
              enriched.album = release.title;
              enriched.year = release.date ? release.date.substring(0, 4) : undefined;
            }
          }
        }
      }
    } catch (e) {
      console.error("MusicBrainz enrichment error:", e);
    }

    // Ensure we have a high quality cover
    if (enriched.videoId) {
      // YouTube fallback logic for cover
      // Since we can't easily check if maxresdefault exists without a HEAD request (which has CORS issues often),
      // we'll provide maxresdefault as primary, and we can rely on standard image fallback in the UI.
      // We will handle that in the ListeningWidget.
      enriched.cover = `https://i.ytimg.com/vi/${enriched.videoId}/maxresdefault.jpg`;
    }

    return enriched;
  }

  getCurrentTrack(): TrackData | null {
    return this.currentTrack;
  }

  getState(): PlayerState {
    return this.state;
  }

  getProgress(): number {
    return this.progress;
  }

  getDuration(): number {
    return this.duration;
  }

  async play(track: TrackData): Promise<void> {
    this.setState("loading");

    const enrichedTrack = await this.enrichTrackData(track);
    this.currentTrack = enrichedTrack;
    this.progress = 0;

    if (this.playerInstance) {
      this.playerInstance.loadVideoById(track.videoId);
    } else {
      // Player will auto-play when ready because of playerVars
      this.setState("idle"); // Will change to loading/playing by the player component
    }
  }

  pause(): void {
    if (this.playerInstance) {
      this.playerInstance.pauseVideo();
    }
  }

  resume(): void {
    if (this.playerInstance) {
      this.playerInstance.playVideo();
    }
  }

  stop(): void {
    if (this.playerInstance) {
      this.playerInstance.stopVideo();
    }
    this.currentTrack = null;
    this.setState("idle");
    this.progress = 0;
    this.stopProgressTracking();
  }

  // --- Internal methods to communicate with the React Player Component ---

  internalSetPlayer(player: YouTubePlayer | null) {
    this.playerInstance = player;
  }

  internalSetState(ytState: number) {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
    switch (ytState) {
      case -1:
      case 5:
        this.setState("idle");
        this.stopProgressTracking();
        break;
      case 0:
        this.setState("idle"); // Ended
        this.stopProgressTracking();
        break;
      case 1:
        this.setState("playing");
        this.startProgressTracking();
        if (this.playerInstance && this.duration === 0) {
          this.duration = this.playerInstance.getDuration() || 0;
        }
        break;
      case 2:
        this.setState("paused");
        this.stopProgressTracking();
        break;
      case 3:
        this.setState("loading");
        this.stopProgressTracking();
        break;
    }
  }

  internalSetError(error: number) {
    this.setState("error");
    this.stopProgressTracking();
    this.notifyError(`YouTube Player Error: ${error}`);
  }

  private setState(newState: PlayerState) {
    if (this.state !== newState) {
      this.state = newState;
      this.notifyStateChange();
    }
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = setInterval(async () => {
      if (this.playerInstance) {
        try {
          const time = await this.playerInstance.getCurrentTime();
          if (time !== undefined && time !== this.progress) {
            this.progress = time;
            this.notifyProgress();
          }
          if (this.duration === 0) {
            this.duration = (await this.playerInstance.getDuration()) || 0;
          }
        } catch (e) {
          // ignore
        }
      }
    }, 1000);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // --- Callbacks ---

  onStateChange(callback: (state: PlayerState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  onProgress(callback: (progress: number) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  private notifyStateChange() {
    this.stateCallbacks.forEach((cb) => cb(this.state));
  }

  private notifyProgress() {
    this.progressCallbacks.forEach((cb) => cb(this.progress));
  }

  private notifyError(error: string) {
    this.errorCallbacks.forEach((cb) => cb(error));
  }

  // --- Render ---

  renderPlayer(): React.ReactNode {
    return <YouTubePlayerComponent provider={this} />;
  }
}

// Global instance to share across the app
export const youtubeProvider = new YouTubeProviderClass();

// The hidden component that actually renders the YouTube iframe
function YouTubePlayerComponent({ provider }: { provider: YouTubeProviderClass }) {
  const track = provider.getCurrentTrack();

  if (!track || !track.videoId) return null;

  return (
    <div className="w-0 h-0 opacity-0 absolute pointer-events-none overflow-hidden">
      <YouTube
        videoId={track.videoId}
        opts={{
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
          },
        }}
        onReady={(event) => {
          provider.internalSetPlayer(event.target);
        }}
        onStateChange={(event) => {
          provider.internalSetState(event.data);
        }}
        onError={(event) => {
          provider.internalSetError(event.data);
        }}
      />
    </div>
  );
}
