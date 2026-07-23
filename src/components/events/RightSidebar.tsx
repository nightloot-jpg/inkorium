import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "./EventCard";

export function RightSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const friendsAttending = [
    {
      id: "f1",
      name: "Carlos Gómez",
      avatar: "https://i.pravatar.cc/150?u=a2",
      event: [][0],
    },
    {
      id: "f2",
      name: "Sofía Martínez",
      avatar: "https://i.pravatar.cc/150?u=a5",
      event: [][1],
    },
  ];

  return (
    <aside className="space-y-6 hidden xl:block w-[300px] shrink-0">
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex flex-col items-center">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md w-full" />
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-4">
          AMIGOS QUE ASISTIRÁN ({friendsAttending.length})
        </h4>
        <div className="flex flex-col gap-3">
          {friendsAttending.map((friend) => (
            <div key={friend.id} className="flex gap-3">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-8 h-8 rounded shrink-0 object-cover border border-border"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-primary hover:underline cursor-pointer truncate">
                  {friend.name}
                </span>
                <span className="text-[11px] text-muted-foreground">Asistirá a:</span>
                <div className="mt-1.5 p-2 bg-muted/30 rounded border border-border/50">
                  <div className="flex gap-2">
                    <img
                      src={(friend.event as any)?.cover_url}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex flex-col min-w-0 justify-center">
                      <span className="text-[10px] font-bold text-foreground truncate">
                        {(friend.event as any)?.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {(friend.event as any)?.start_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-4">
          EVENTOS RECOMENDADOS
        </h4>
        <div className="flex flex-col gap-3">
          {([] as any[]).map((event: any) => (
            <EventCard key={event.id} event={event} variant="sidebar" />
          ))}
        </div>
      </div>
    </aside>
  );
}
