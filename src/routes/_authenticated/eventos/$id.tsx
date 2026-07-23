import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventDetail } from "@/components/events/detail/EventDetail";
import { Loader2 } from "lucide-react";
import React from "react";

// For type checking to pass we use a fallback type for params if it doesn't exist in generated routes
// @ts-ignore
export const Route = createFileRoute("/_authenticated/eventos/$id")({
  component: EventDetailPage,
});

function EventDetailPage() {
  // @ts-ignore
  const { id } = Route.useParams();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      // Fetch event
      // Get current user to see their status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch event

      // Check if id is a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from("events").select("*, creator:profiles!events_author_id_fkey(*)");

      if (isUUID) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id);
      }

      const { data: event, error: eventError } = await query.maybeSingle();

      if (eventError) throw eventError;

      if (!event) throw new Error("Event not found");
      // Fetch attendees
      const { data: attendeesData, error: attError } = await supabase
        .from("event_attendees")
        .select("status, user:profiles(*)")
        .eq("event_id", event?.id);

      if (attError) throw attError;

      // Map attendees
      const attendingList = (attendeesData || [])
        .filter((a: any) => a.status === "attending")
        .map((att: any) => ({
          id: att.user.id,
          name: att.user.display_name,
          username: att.user.username,
          avatar: att.user.avatar_url,
          status: att.status,
        }));

      const interestedList = (attendeesData || []).filter((a: any) => a.status === "interested");
      const userStatus = user
        ? (attendeesData || []).find((a: any) => a.user?.id === user.id)?.status
        : null;

      (event as any).status = userStatus;
      (event as any).interestedCount = interestedList.length;

      // Find related events
      const { data: relatedEventsData, error: relatedError } = await supabase
        .from("events")
        .select("*")
        .eq("author_id", event.author_id)
        .neq("id", event.id)
        .order("start_date", { ascending: true })
        .limit(3);

      if (relatedError) {
        console.error("Error fetching related events:", relatedError);
      }

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

      const images = event.cover_url
        ? [
            event.cover_url,
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3",
          ]
        : [];

      return {
        event: {
          ...event,
          cover_url:
            event.cover_url ||
            "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3",
          price: 0,
        },
        organizer: event.creator,
        attendees: attendingList,
        relatedEvents,
        images,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!eventData?.event) {
    return <div className="text-center p-8">Evento no encontrado</div>;
  }

  return (
    <>
      <EventDetail
        event={eventData.event}
        organizer={eventData.organizer}
        attendees={eventData.attendees}
        images={eventData.images}
      />
    </>
  );
}
