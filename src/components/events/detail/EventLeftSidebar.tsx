import React from "react";
import { MapPin, Clock, Users, Calendar, Tag, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface EventLeftSidebarProps {
  event: any;
  organizer: any;
  attendees: any[];
}

export function EventLeftSidebar({ event, organizer, attendees }: EventLeftSidebarProps) {
  const dateObj = new Date(event.event_date);
  const fullDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <aside className="space-y-6 hidden lg:block w-full">
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
        <h3 className="text-[14px] font-bold text-foreground mb-4 uppercase tracking-wide">
          Información Rápida
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground capitalize">{fullDate}</span>
              <span className="text-[13px] text-muted-foreground">{event.event_time}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground">{event.location}</span>
              <span className="text-[13px] text-muted-foreground">{event.city}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground">{event.category}</span>
              <span className="text-[13px] text-muted-foreground">Categoría</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-5 flex items-center justify-center shrink-0 mt-0.5 text-primary font-bold text-[16px]">
              €
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground">
                {event.price === 0 ? "Gratis" : `${event.price} €`}
              </span>
              <span className="text-[13px] text-muted-foreground">Precio</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-foreground">Público</span>
              <span className="text-[13px] text-muted-foreground">Estado</span>
            </div>
          </div>

          {organizer && (
            <div className="flex items-start gap-3 pt-3 border-t border-border/50">
              <img
                src={
                  organizer.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(organizer.display_name)}&background=random`
                }
                alt={organizer.display_name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-[14px] font-bold text-foreground">
                  <Link
                    to="/perfil/$username"
                    params={{ username: organizer.username }}
                    className="hover:underline"
                  >
                    {organizer.display_name}
                  </Link>
                </span>
                <span className="text-[12px] text-muted-foreground">Organizador</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Users className="size-4" />
            Asistentes ({attendees.length})
          </h3>
        </div>

        {attendees.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {attendees.slice(0, 8).map((attendee) => (
                <Link
                  key={attendee.id}
                  to="/perfil/$username"
                  params={{ username: attendee.username }}
                  className="group"
                  title={attendee.name}
                >
                  <img
                    src={
                      attendee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`
                    }
                    alt={attendee.name}
                    className="w-full aspect-square rounded object-cover border border-transparent group-hover:border-primary transition-colors"
                  />
                </Link>
              ))}
            </div>
            <Button variant="outline" className="w-full text-[13px] h-9 font-bold">
              Ver todos
            </Button>
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground text-center py-2">
            Aún no hay asistentes confirmados.
          </p>
        )}
      </div>
    </aside>
  );
}
