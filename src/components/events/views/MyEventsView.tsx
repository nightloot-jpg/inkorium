import React from "react";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTS } from "@/components/events/types";

export function MyEventsView() {
  const savedEvents = MOCK_EVENTS.slice(0, 2);

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mis eventos</h1>
        <p className="text-muted-foreground text-[15px]">
          Eventos a los que asistes o te interesan.
        </p>
      </div>

      {savedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
          <p className="text-muted-foreground font-medium">Aún no tienes eventos guardados.</p>
        </div>
      )}
    </>
  );
}
