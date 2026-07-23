import React from "react";
import { EventData } from "./types";

interface MiniEventProps {
  event: EventData;
}

export function MiniEvent({ event }: MiniEventProps) {
  return (
    <div className="flex gap-3 group cursor-pointer">
      <img
        src={event.cover}
        alt={event.title}
        className="w-[60px] h-[60px] rounded object-cover border border-border"
      />
      <div className="flex flex-col justify-center min-w-0">
        <h5 className="text-[13px] font-bold text-primary group-hover:underline truncate">
          {event.title}
        </h5>
        <span className="text-[12px] text-muted-foreground truncate">{event.location}</span>
        <span className="text-[11px] font-medium text-foreground mt-0.5">{event.date}</span>
      </div>
    </div>
  );
}
