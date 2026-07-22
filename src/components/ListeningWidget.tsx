import React from "react";
import { Play, Pause, Heart, Plus, Share2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export interface ListeningWidgetProps {
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  year?: string;
  genre?: string;
  duration?: string;
  progress?: string;
  provider?: "Spotify" | "YouTube Music" | "Deezer";
  liked?: boolean;
  playlists?: number;
  listeners?: string[];
  likesCount?: number;
  playsCount?: number;
  timestamp?: string;
  isPlaying?: boolean;
  empty?: boolean;
  compact?: boolean;
}

export function ListeningWidget({
  title,
  artist,
  album,
  cover,
  year,
  genre,
  duration,
  progress,
  provider = "Spotify",
  liked = false,
  playlists = 0,
  listeners = [],
  likesCount = 0,
  playsCount = 0,
  timestamp,
  isPlaying = false,
  empty = false,
  compact = false,
}: ListeningWidgetProps) {
  if (empty) {
    return (
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="text-[15px] font-bold text-foreground mb-2">
          Todavía no has compartido música.
        </h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          Conecta Spotify o publica una canción.
        </p>
        <Button variant="outline" className="text-[13px] font-medium" size="sm">
          Conectar Spotify
        </Button>
      </div>
    );
  }

  // Parse progress and duration for custom bar
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
  };

  const prog = parseTime(progress);
  const dur = parseTime(duration);
  const percent = dur > 0 ? (prog / dur) * 100 : 0;

  return (
    <div
      className={`bg-card rounded-sm border border-[#c2c9d6] shadow-sm flex flex-col ${compact ? "p-4" : "p-5"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {isPlaying ? (
          <>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              🎵 ESCUCHANDO AHORA
              <div className="size-2 rounded-full bg-green-500 shrink-0 shadow-[0_0_4px_rgba(34,197,94,0.6)] animate-pulse" />
            </span>
          </>
        ) : (
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            🎵 ÚLTIMA CANCIÓN <span className="font-normal lowercase ml-1">{timestamp}</span>
          </span>
        )}
      </div>

      {/* Cover and Info */}
      <div className="flex gap-4 mb-5">
        <div
          className={`shrink-0 rounded-sm bg-black overflow-hidden flex items-center justify-center shadow-sm ${compact ? "size-[64px]" : "size-[80px]"}`}
        >
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/50 text-[10px] text-center px-1">Sin portada</span>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h3
            className={`${compact ? "text-[14px]" : "text-[16px]"} font-bold text-foreground truncate leading-tight`}
          >
            {title}
          </h3>
          <p
            className={`${compact ? "text-[13px]" : "text-[14px]"} text-muted-foreground truncate mt-0.5`}
          >
            {artist}
          </p>
          <p
            className={`${compact ? "text-[12px]" : "text-[13px]"} text-muted-foreground/80 truncate mt-0.5 italic`}
          >
            {album}
          </p>
          {!compact && (genre || year) && (
            <p className="text-[11px] text-muted-foreground mt-1">
              {[genre, year].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] text-muted-foreground font-medium w-8 text-right shrink-0">
          {progress || "0:00"}
        </span>
        <div className="flex-1 relative h-1.5 rounded-full bg-secondary overflow-visible group cursor-pointer">
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${percent}%` }}
          />
          {/* Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${percent}% - 6px)` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground font-medium w-8 shrink-0">
          {duration || "0:00"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-secondary pt-3 mt-1">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50"
          >
            <Heart className={`size-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground">
            <Plus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground">
            <Share2 className="size-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5 rounded-full px-3">
          <ExternalLink className="size-3" />
          Abrir en {provider}
        </Button>
      </div>

      {/* Provider Info */}
      <div className="text-center mt-3 mb-1">
        <span className="text-[11px] text-muted-foreground">
          Escuchando desde <strong className="font-medium text-foreground">{provider}</strong>
        </span>
      </div>

      {/* Social & Stats (Hidden in compact view to save space, or shown simplified) */}
      {!compact && (
        <>
          <div className="mt-4 pt-4 border-t border-secondary flex flex-col gap-3">
            {listeners.length > 0 ? (
              <div className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-foreground mb-1 block">
                  También la escuchan
                </span>
                <ul className="space-y-0.5">
                  {listeners.map((listener, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <div className="size-1 bg-muted-foreground rounded-full" />
                      {listener}
                    </li>
                  ))}
                </ul>
              </div>
            ) : likesCount > 0 ? (
              <div className="text-[12px] text-muted-foreground">
                A {likesCount} personas les gusta este álbum
              </div>
            ) : null}

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
              {playsCount > 0 && <span>{playsCount} reproducciones</span>}
              {likesCount > 0 && <span>{likesCount} Me gusta</span>}
              {playlists > 0 && <span>{playlists} playlists</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
