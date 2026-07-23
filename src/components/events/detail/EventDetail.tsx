import React from "react";
import { EventHeader } from "./EventHeader";
import { EventDescription } from "./EventDescription";
import { EventMap } from "./EventMap";
import { EventAttendees } from "./EventAttendees";
import { EventGallery } from "./EventGallery";
import { EventComments } from "./EventComments";

interface EventDetailProps {
  event: any;
  organizer: any;
  attendees: any[];
  images: string[];
}

export function EventDetail({ event, organizer, attendees, images }: EventDetailProps) {
  return (
    <div className="flex flex-col gap-6 min-w-0">
      <EventHeader event={event} organizer={organizer} attendeesCount={attendees.length} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr] gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          <EventDescription description={event.description} />

          <EventMap location={event.location} city={event.city} />

          <EventAttendees attendees={attendees} />

          {images && images.length > 0 && <EventGallery images={images} />}

          <EventComments eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
