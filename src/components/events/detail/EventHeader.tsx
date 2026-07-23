import React, { useState } from "react";
import { Share, Bookmark, MapPin, Clock, Heart, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventHeaderProps {
  event: any; // Using any for now until we fully type the supabase event
  organizer: any;
  attendeesCount: number;
}

export function EventHeader({ event, organizer, attendeesCount }: EventHeaderProps) {
  const [isInterested, setIsInterested] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const dateObj = new Date(event.date);
  // event.date is likely a string like "2026-10-15"
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("es-ES", { month: "short" });

  const coverUrl =
    event.cover_url ||
    "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden flex flex-col shadow-sm">
      <div className="w-full h-[300px] relative">
        <img src={coverUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center bg-background text-foreground shadow-md rounded-sm w-[60px] h-[65px] border border-border">
          <span className="text-[26px] font-extrabold leading-none text-primary">{day}</span>
          <span className="text-[13px] font-bold uppercase">{month}</span>
        </div>
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-sm text-[14px] font-medium">
          {event.category}
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col">
        <h1 className="text-3xl font-extrabold text-foreground mb-4">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <MapPin className="size-5 text-muted-foreground shrink-0" />
            <span>
              {event.location}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Clock className="size-5 text-muted-foreground shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Users className="size-5 text-muted-foreground shrink-0" />
            <span>{attendeesCount} asistentes</span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <span className="font-bold text-foreground">
              Precio: {event.price ? `${event.price}€` : "Gratis"}
            </span>
            {organizer && (
              <span className="border-l pl-3 border-border/50">
                Por{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  {organizer.display_name}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2 border-t border-border/50 pt-6">
          <Button
            onClick={() => setIsInterested(!isInterested)}
            variant="outline"
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold h-11 px-6 rounded-sm ${
              isInterested
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
            }`}
          >
            <Heart className={`size-4 ${isInterested ? "fill-current" : ""}`} />
            Me interesa
          </Button>

          <Button
            onClick={() => setIsAttending(!isAttending)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold h-11 px-6 rounded-sm ${
              isAttending
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {isAttending ? <Check className="size-4" /> : <Users className="size-4" />}
            Asistiré
          </Button>

          <Button
            variant="outline"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-sm"
          >
            <Share className="size-4" />
            Compartir
          </Button>

          <Button
            onClick={() => setIsSaved(!isSaved)}
            variant="outline"
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-sm ${isSaved ? "text-primary border-primary/50" : ""}`}
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
