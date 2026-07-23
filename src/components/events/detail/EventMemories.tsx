import React from "react";
import { Camera, Music, Video, Star } from "lucide-react";
import { ListeningWidget } from "@/components/ListeningWidget";
import { TrackData } from "@/lib/music/types";

interface EventMemoriesProps {
  event: any;
  attendees: any[];
  images: string[];
}

export function EventMemories({ event, attendees, images }: EventMemoriesProps) {
  // Mock playlist for the memories block
  const eventPlaylist: TrackData = {
    provider: "YouTube",
    url:
      event.youtube_song || event.youtube_playlist || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    title: "Música del evento",
    artist: event.name || "Evento",
    cover:
      event.cover_url ||
      "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3",
    duration: "6:12",
  };

  return (
    <div className="bg-primary/5 rounded-md border border-primary/20 p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-2">
          <Star className="size-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">Recuerdos del evento</h2>
        <p className="text-muted-foreground text-[15px] max-w-lg">
          Este evento ya ha finalizado. Aquí puedes revivir los mejores momentos, fotos y música que
          se compartió.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photos snapshot */}
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm">
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Camera className="size-4" />
            Fotos destacadas
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-full aspect-square object-cover rounded-sm"
                alt="Memory"
              />
            ))}
            {images.length === 0 && (
              <div className="col-span-2 text-center text-muted-foreground text-sm py-4">
                No hay fotos compartidas
              </div>
            )}
          </div>
        </div>

        {/* Music snapshot */}
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm flex flex-col">
          <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
            <Music className="size-4" />
            Música del evento
          </h3>
          <div className="flex-1 flex items-center justify-center"></div>
        </div>
      </div>
    </div>
  );
}
