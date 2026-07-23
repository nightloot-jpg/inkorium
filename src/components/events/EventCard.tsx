import React from "react";
import { MapPin, Clock, Users } from "lucide-react";
import { EventData } from "./types";

interface EventCardProps {
  event: EventData;
}

export function EventCard({ event }: EventCardProps) {
  const dateParts = event.date.split(" ");
  const day = dateParts[0];
  const month = dateParts[1];

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] flex flex-col sm:flex-row shadow-sm hover:border-primary/50 transition-colors overflow-hidden">
      <div className="hidden sm:flex flex-col items-center justify-start py-6 px-4 w-[80px] border-r border-[#c2c9d6] shrink-0 bg-muted/20">
        <span className="text-[28px] font-extrabold text-primary leading-none mb-1">{day}</span>
        <span className="text-[12px] font-bold text-muted-foreground uppercase">{month}</span>
      </div>

      <div className="sm:hidden flex items-center gap-2 p-4 border-b border-border bg-muted/10">
        <span className="text-[20px] font-extrabold text-primary leading-none">{day}</span>
        <span className="text-[13px] font-bold text-muted-foreground uppercase">{month}</span>
      </div>

      <div className="flex flex-col sm:flex-row flex-1">
        <div className="sm:w-[220px] h-[160px] sm:h-auto shrink-0 relative">
          <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 sm:hidden bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-sm text-[11px] font-medium">
            {event.category}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1 justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[16px] font-bold text-foreground truncate max-w-[85%]">
                {event.title}
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                {event.category}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">
                  {event.location}, {event.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Users className="size-3.5 shrink-0" />
                <span>{event.interested} asistentes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex -space-x-1.5">
              {event.attendees.slice(0, 3).map((attendee, i) => (
                <img
                  key={attendee.id}
                  src={attendee.avatar}
                  alt={attendee.name}
                  className="w-6 h-6 rounded-full border border-card object-cover"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-primary/10 text-primary font-bold text-[12px] px-3 py-1.5 rounded transition-colors hover:bg-primary/20">
                Me interesa
              </button>
              <button className="bg-secondary text-secondary-foreground font-bold text-[12px] px-3 py-1.5 rounded transition-colors hover:bg-secondary/80">
                Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
