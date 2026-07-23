import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { EventCard } from "@/components/events/EventCard";

export function CalendarView() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Simulated events for the selected date
  const dateEvents = ([] as any[]).slice(2, 4);

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Calendario</h1>
        <p className="text-muted-foreground text-[15px]">Explora eventos por fecha.</p>
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex justify-center mb-6">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
      </div>

      {date && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Eventos para {date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
          </h2>
          {dateEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dateEvents.map((event: any) => (
                <EventCard key={event.id} event={event} variant="important" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay eventos para esta fecha.</p>
          )}
        </div>
      )}
    </>
  );
}
