import React from "react";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTS } from "@/components/events/types";

export function FriendsAttendingView() {
  const friendEvents = MOCK_EVENTS.slice(1, 3);

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Amigos que asistirán
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Descubre a dónde van tus amigos próximamente.
        </p>
      </div>

      {friendEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
          <p className="text-muted-foreground font-medium">
            No hay eventos próximos de tus amigos.
          </p>
        </div>
      )}
    </>
  );
}
