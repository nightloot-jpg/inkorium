import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTS } from "@/components/events/types";
import { Route } from "@/routes/_authenticated/eventos/route";

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

  const filteredEvents = useMemo(() => {
    let result = [...MOCK_EVENTS];

    if (activeCategory !== "Todos") {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.artist?.toLowerCase().includes(q) ||
          e.organizer?.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      switch (activeSort) {
        case "Más populares":
          return b.interested - a.interested;
        case "Más asistentes":
          return b.attendees.length - a.attendees.length;
        case "Alfabético":
          return a.title.localeCompare(b.title);
        case "Más recientes":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "Más próximos":
        default:
          return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
      }
    });

    return result;
  }, [activeCategory, searchQuery, activeSort]);

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
