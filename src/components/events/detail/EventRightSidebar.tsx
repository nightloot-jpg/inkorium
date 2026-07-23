import React from "react";
import { EventOrganizer } from "./EventOrganizer";
import { EventCard } from "../EventCard";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventRightSidebarProps {
  organizer: any;
  relatedEvents: any[];
  eventData: any;
}

export function EventRightSidebar({ organizer, relatedEvents, eventData }: EventRightSidebarProps) {
  const handleAddToCalendar = () => {
    // Generate an ICS file or open Google Calendar
    if (!eventData) return;
    const title = encodeURIComponent(eventData.title);
    const details = encodeURIComponent(eventData.description || "");
    const location = encodeURIComponent(`${eventData.location}, ${eventData.city}`);

    // Using simple formatting for dates assuming format like YYYY-MM-DD and HH:MM
    // Fallback if full ISO not easily parsed:
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gCalUrl, "_blank");
  };

  return (
    <aside className="space-y-6 hidden xl:block w-[300px] shrink-0">
      <EventOrganizer organizer={organizer} />

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm">
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          className="w-full h-10 gap-2 font-bold justify-center"
        >
          <Calendar className="size-4" />
          Añadir a mi calendario
        </Button>
      </div>

      {relatedEvents && relatedEvents.length > 0 && (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-4">
            MÁS DE {organizer?.display_name?.toUpperCase() || "ESTE ORGANIZADOR"}
          </h4>
          <div className="flex flex-col gap-3">
            {relatedEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="sidebar" />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
