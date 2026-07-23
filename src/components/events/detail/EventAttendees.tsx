import React from "react";
import { Link } from "@tanstack/react-router";

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  status: "attending" | "interested";
  username: string;
}

interface EventAttendeesProps {
  attendees: Attendee[];
}

export function EventAttendees({ attendees }: EventAttendeesProps) {
  if (attendees.length === 0) return null;

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Asistirán{" "}
        <span className="text-muted-foreground text-[16px] font-normal ml-1">
          ({attendees.length})
        </span>
      </h2>

      <div className="flex flex-wrap gap-4">
        {attendees.map((attendee) => (
          <Link
            key={attendee.id}
            to="/perfil/$username"
            params={{ username: attendee.username }}
            className="flex flex-col items-center gap-2 group w-20"
          >
            <img
              src={
                attendee.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`
              }
              alt={attendee.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors"
            />
            <span className="text-[12px] font-medium text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
              {attendee.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
