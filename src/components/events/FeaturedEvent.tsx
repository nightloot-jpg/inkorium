import React from "react";
import { MapPin, Clock, Users } from "lucide-react";
import { EventData } from "./types";

interface FeaturedEventProps {
  event: EventData;
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden flex flex-col w-full shadow-sm">
      <div className="relative w-full h-[300px]">
        <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-sm text-sm font-bold shadow-md">
          {event.date}
        </div>
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-sm text-xs font-medium">
          {event.category}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{event.title}</h2>
        <p className="text-muted-foreground text-[14px] mb-5">{event.description}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <MapPin className="size-4 text-muted-foreground" />
            {event.location}, {event.city}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <Clock className="size-4 text-muted-foreground" />
            {event.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <Users className="size-4 text-muted-foreground" />
            {event.interested} asistentes
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-5 mt-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {event.attendees.map((attendee, i) => (
                <img
                  key={attendee.id}
                  src={attendee.avatar}
                  alt={attendee.name}
                  className="w-8 h-8 rounded-full border-2 border-card object-cover"
                  style={{ zIndex: event.attendees.length - i }}
                />
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground ml-2">
              <span className="font-medium text-foreground">{event.attendees[0]?.name}</span> y{" "}
              {event.interested - 1} más asistirán
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none bg-primary text-primary-foreground font-bold text-sm px-5 py-2 rounded transition-colors hover:bg-primary/90">
              Me interesa
            </button>
            <button className="flex-1 sm:flex-none bg-secondary text-secondary-foreground font-bold text-sm px-5 py-2 rounded transition-colors hover:bg-secondary/80">
              Ver evento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
