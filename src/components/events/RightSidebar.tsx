import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function RightSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: latestEvents = [] } = useQuery({
    queryKey: ["latest-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: friendsAttending = [] } = useQuery({
    queryKey: ["friends-attending"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friends } = await supabase
        .from("friendships")
        .select("addressee_id")
        .eq("requester_id", user.id)
        .eq("status", "accepted");

      const friendIds = friends?.map((f) => f.addressee_id) || [];

      if (friendIds.length === 0) return [];

      const { data, error } = await supabase
        .from("event_attendees")
        .select(
          `
          user_id,
          status,
          profiles:user_id(name, avatar_url),
          events(id, title, cover_url, start_date, slug)
        `,
        )
        .in("user_id", friendIds)
        .eq("status", "attending")
        .limit(4);

      if (error) return [];
      return data || [];
    },
  });

  return (
    <aside className="space-y-6 hidden xl:block w-[320px] shrink-0">
      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-4 flex flex-col items-center shadow-sm">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md w-full" />
      </div>

      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-extrabold text-foreground">Amigos que van</h4>
          <span className="text-[12px] font-medium text-primary cursor-pointer hover:underline">
            Ver todos
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {friendsAttending.length > 0 ? (
            friendsAttending.map((friend: any, index) => (
              <div key={`${friend.user_id}-${index}`} className="flex gap-3">
                <img
                  src={friend.profiles?.avatar_url || "https://i.pravatar.cc/150?u=a2"}
                  alt={friend.profiles?.name}
                  className="w-10 h-10 rounded-full shrink-0 object-cover border border-border"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-foreground hover:text-primary cursor-pointer truncate">
                    {friend.profiles?.name || "Usuario"}
                  </span>

                  <Link to="/eventos/$id" params={{ id: friend.events?.slug || friend.events?.id || "0" }}
                    className="mt-1 flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-[8px] border border-border/50 group"
                  >
                    <img
                      src={
                        friend.events?.cover_url ||
                        "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3"
                      }
                      alt=""
                      className="w-10 h-10 rounded-[6px] object-cover"
                    />
                    <div className="flex flex-col min-w-0 justify-center">
                      <span className="text-[12px] font-bold text-foreground group-hover:text-primary truncate transition-colors">
                        {friend.events?.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {friend.events?.start_date
                          ? format(new Date(friend.events.start_date), "d MMM", { locale: es })
                          : ""}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay amigos asistiendo a eventos próximos.
            </p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-extrabold text-foreground">Eventos recomendados</h4>
        </div>

        <div className="flex flex-col gap-4">
          {latestEvents.map((event: any) => (
            <div key={event.id} className="flex gap-3 group">
              <Link to="/eventos/$id" params={{ id: event.slug || event.id || "0" }} className="shrink-0">
                <img
                  src={
                    event.cover_url ||
                    "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3"
                  }
                  alt={event.title}
                  className="w-16 h-16 rounded-[8px] object-cover group-hover:opacity-90 transition-opacity"
                />
              </Link>
              <div className="flex flex-col flex-1 min-w-0 py-0.5 justify-between">
                <Link to="/eventos/$id" params={{ id: event.slug || event.id || "0" }}>
                  <h5 className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </h5>
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    {event.city || "Ciudad"} •{" "}
                    {event.start_date
                      ? format(new Date(event.start_date), "d MMM", { locale: es })
                      : ""}
                  </p>
                </Link>
                <button className="text-[11px] font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground py-1 px-3 rounded-[6px] self-start mt-1 transition-colors">
                  Me interesa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
