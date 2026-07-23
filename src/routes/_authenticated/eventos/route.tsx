import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { z } from "zod";
import { LeftSidebar } from "@/components/events/LeftSidebar";
import { RightSidebar } from "@/components/events/RightSidebar";
import { EventRightSidebar } from "@/components/events/detail/EventRightSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const eventsSearchSchema = z.object({
  category: z.string().optional().default("Todos"),
  q: z.string().optional().default(""),
  filters: z.array(z.string()).optional().default([]),
  sort: z.string().optional().default("Más próximos"),
});

export const Route = createFileRoute("/_authenticated/eventos")({
  validateSearch: eventsSearchSchema,
  component: EventosLayout,
});

function EventosLayout() {
  const matches = useMatches();
  // Check if we are on the event detail route
  const eventDetailMatch = matches.find(
    (m) => (m.routeId as string) === "/_authenticated/eventos/$id",
  );
  const isEventDetail = !!eventDetailMatch;
  const eventId = (eventDetailMatch?.params as any)?.id as string | undefined;

  // We need to fetch basic event data here if we want to pass it to the EventRightSidebar
  // Alternatively, the EventRightSidebar can fetch its own data.
  // Let's do a lightweight fetch here or rely on react-query cache since it's fetched in $id.tsx.

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    enabled: isEventDetail && !!eventId,
    queryFn: async () => {
      const { data: event, error } = await supabase
        .from("events")
        .select("*, creator:profiles!events_author_id_fkey(*)")
        .or(`id.eq.${eventId || "00000000-0000-0000-0000-000000000000"},slug.eq.${eventId || ""}`)
        .single();

      if (error) throw error;

      const { data: relatedEventsData } = await supabase
        .from("events")
        .select("*")
        .eq("author_id", event.author_id)
        .neq("id", event.id)
        .order("event_date", { ascending: true })
        .limit(3);

      const relatedEvents = (relatedEventsData || []).map((ev) => ({
        ...ev,
        cover:
          ev.cover_url ||
          "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3",
        price: 0,
        attendees: [],
        interested: 0,
        friendsAttending: 0,
      }));

      return { event, organizer: event.creator, relatedEvents };
    },
  });

  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-[30px] py-4 w-full">
      <LeftSidebar />
      <div className="flex flex-col gap-6 min-w-0">
        <Outlet />
      </div>
      {isEventDetail && eventData ? (
        <EventRightSidebar
          event={eventData.event}
          organizer={eventData.organizer}
          relatedEvents={eventData.relatedEvents}
          attendees={[]}
        />
      ) : (
        <RightSidebar />
      )}
    </main>
  );
}
