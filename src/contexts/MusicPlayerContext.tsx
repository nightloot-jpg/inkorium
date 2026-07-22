import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MusicProvider, PlayerState, TrackData } from "@/lib/music/types";
import { youtubeProvider } from "@/lib/music/YouTubeProvider";

interface MusicPlayerContextType {
  provider: MusicProvider; // Current active provider
  track: TrackData | null;
  state: PlayerState;
  progress: number;
  duration: number;
  play: (track: TrackData) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek?: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  // For now, hardcode to YouTube provider.
  // When adding Spotify/Deezer, this could be dynamic based on the track.
  const provider = youtubeProvider;

  const [track, setTrack] = useState<TrackData | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const unsubState = provider.onStateChange((newState) => {
      setState(newState);
      setTrack(provider.getCurrentTrack());
      setDuration(provider.getDuration());
    });

    const unsubProgress = provider.onProgress((newProgress) => {
      setProgress(newProgress);
      // Ensure duration is updated if it wasn't available immediately
      if (duration === 0) setDuration(provider.getDuration());
    });

    return () => {
      unsubState();
      unsubProgress();
    };
  }, [provider, duration]);

  const value: MusicPlayerContextType = {
    provider,
    track,
    state,
    progress,
    duration,
    play: async (newTrack) => {
      setTrack(newTrack);
      await provider.play(newTrack);
    },
    pause: () => provider.pause(),
    resume: () => provider.resume(),
    stop: () => provider.stop(),
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Render the hidden player for the current provider */}
      {provider.renderPlayer?.()}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}
