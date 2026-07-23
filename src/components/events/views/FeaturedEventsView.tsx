import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { Route } from "@/routes/_authenticated/eventos/route";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const SORT_OPTIONS = [
  "Más próximos",
  "Más populares",
  "Más asistentes",
  "Alfabético",
  "Más recientes",
];

export function FeaturedEventsView() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const searchQuery = searchParams.q || "";
  const activeSort = searchParams.sort || "Más próximos";
  const activeCategory = searchParams.category || "Todos";

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        navigate({
          to: "/eventos",
          search: { ...searchParams, q: localSearch },
        });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, navigate, searchParams, searchQuery]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({
      to: "/eventos",
      search: { ...searchParams, sort: e.target.value },
    });
  };

  const { data: events = [] } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          author:profiles!events_author_id_fkey(*),
          event_attendees(user_id, status)
        `,
        )
        .eq("status", "published");

      if (error) throw error;

      // Transformar los datos para el frontend
      return (data || []).map((event) => {
        const attendees = event.event_attendees?.filter((a: any) => a.status === "attending") || [];
        const interested =
          event.event_attendees?.filter((a: any) => a.status === "interested") || [];
        const userStatus = user
          ? event.event_attendees?.find((a: any) => a.user_id === user.id)?.status
          : null;

        return {
          ...event,
          attendees: attendees,
          attendeesCount: attendees.length,
          interestedCount: interested.length,
          status: userStatus,
          author_name: (event.author as any)?.name || event.organizer_name || "Desconocido",
          author_avatar: (event.author as any)?.avatar_url || "https://github.com/shadcn.png",
        };
      });
    },
  });

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (activeCategory !== "Todos") {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          ((e as any).title || "").toLowerCase().includes(q) ||
          (e.organizer_name || "").toLowerCase().includes(q) ||
          (e.city || "").toLowerCase().includes(q) ||
          ((e as any).location || "").toLowerCase().includes(q) ||
          (e.category || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      switch (activeSort) {
        case "Más populares":
          return ((b as any).attendeesCount || 0) - ((a as any).attendeesCount || 0);
        case "Más asistentes":
          return ((b as any).attendeesCount || 0) - ((a as any).attendeesCount || 0);
        case "Alfabético":
          return ((a as any).title || "").localeCompare((b as any).title || "");
        case "Más recientes":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "Más próximos":
        default:
          return (
            new Date((a as any).start_date || 0).getTime() -
            new Date((b as any).start_date || 0).getTime()
          );
      }
    });

    return result;
  }, [activeCategory, searchQuery, activeSort, events]);

  const featuredEvent = filteredEvents.length > 0 ? filteredEvents[0] : null;
  const importantEvents = filteredEvents.slice(1, 3);
  const compactEvents = filteredEvents.slice(3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Eventos destacados
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Descubre conciertos, festivales y actividades cerca de ti.
        </p>
      </div>

      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por evento, artista, ciudad, categoría..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-sm border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={activeSort}
          onChange={handleSortChange}
          className="h-10 px-3 rounded-sm border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-48"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-sm border border-[#c2c9d6]">
          <p className="text-muted-foreground font-medium text-lg mb-1">
            No se han encontrado eventos.
          </p>
          <p className="text-muted-foreground text-sm">
            Prueba a cambiar los filtros o la búsqueda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {featuredEvent && (
            <div className="w-full">
              <EventCard event={featuredEvent} variant="featured" />
            </div>
          )}

          {importantEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importantEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="important" />
              ))}
            </div>
          )}

          {compactEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {compactEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
