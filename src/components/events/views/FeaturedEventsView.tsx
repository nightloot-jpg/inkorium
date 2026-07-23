import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTS, MOCK_CATEGORIES } from "@/components/events/types";
import { Route } from "@/routes/_authenticated/eventos/route";

const QUICK_FILTERS = [
  "Hoy",
  "Esta semana",
  "Este mes",
  "Gratis",
  "De pago",
  "Cerca de mí",
  "Online",
  "Con amigos",
  "Populares",
];

const SORT_OPTIONS = [
  "Más próximos",
  "Más populares",
  "Más recientes",
  "Más asistentes",
  "Alfabético",
];

export function FeaturedEventsView() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const activeCategory = searchParams.category || "Todos";
  const searchQuery = searchParams.q || "";
  const activeFilters = useMemo(() => searchParams.filters || [], [searchParams.filters]);
  const activeSort = searchParams.sort || "Más próximos";

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

  const handleCategoryChange = (category: string) => {
    navigate({
      to: "/eventos",
      search: { ...searchParams, category },
    });
  };

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];

    navigate({
      to: "/eventos",
      search: { ...searchParams, filters: newFilters },
    });
  };

  const removeFilter = (filter: string) => {
    navigate({
      to: "/eventos",
      search: { ...searchParams, filters: activeFilters.filter((f) => f !== filter) },
    });
  };

  const clearFilters = () => {
    navigate({
      to: "/eventos",
      search: { ...searchParams, filters: [], q: "" },
    });
    setLocalSearch("");
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate({
      to: "/eventos",
      search: { ...searchParams, sort: e.target.value },
    });
  };

  // Helper for filtering by date
  const isDateInRange = (dateISO: string, range: "today" | "week" | "month") => {
    // Current mocked date context is 2026-07-23T00:00:00Z
    const mockCurrentDate = new Date("2026-07-23T00:00:00Z");
    const eventDate = new Date(dateISO);

    if (range === "today") {
      return eventDate.toDateString() === mockCurrentDate.toDateString();
    }
    if (range === "week") {
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      return (
        eventDate.getTime() >= mockCurrentDate.getTime() &&
        eventDate.getTime() <= mockCurrentDate.getTime() + msInWeek
      );
    }
    if (range === "month") {
      return (
        eventDate.getMonth() === mockCurrentDate.getMonth() &&
        eventDate.getFullYear() === mockCurrentDate.getFullYear()
      );
    }
    return true;
  };

  const filteredEvents = useMemo(() => {
    let result = [...MOCK_EVENTS];

    // 1. Category Filter
    if (activeCategory !== "Todos") {
      result = result.filter((e) => e.category === activeCategory);
    }

    // 2. Search Query Filter
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

    // 3. Quick Filters
    if (activeFilters.includes("Hoy")) {
      result = result.filter((e) => isDateInRange(e.dateISO, "today"));
    } else if (activeFilters.includes("Esta semana")) {
      result = result.filter((e) => isDateInRange(e.dateISO, "week"));
    } else if (activeFilters.includes("Este mes")) {
      result = result.filter((e) => isDateInRange(e.dateISO, "month"));
    }

    if (activeFilters.includes("Gratis")) {
      result = result.filter((e) => e.price === 0);
    }
    if (activeFilters.includes("De pago")) {
      result = result.filter((e) => e.price > 0);
    }
    if (activeFilters.includes("Online")) {
      result = result.filter((e) => e.isOnline);
    }
    if (activeFilters.includes("Con amigos")) {
      result = result.filter((e) => e.friendsAttending > 0);
    }
    if (activeFilters.includes("Populares")) {
      result = result.filter((e) => e.interested >= 500); // arbitrary popularity threshold
    }

    // 4. Sorting
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
  }, [activeCategory, searchQuery, activeFilters, activeSort]);

  const isFilteringActive =
    searchQuery.trim() !== "" ||
    activeFilters.length > 0 ||
    activeSort !== "Más próximos" ||
    activeCategory !== "Todos";

  return (
    <>
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Eventos destacados
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Descubre conciertos, festivales y actividades cerca de ti.
        </p>
      </div>

      <div className="flex flex-col gap-3 my-4">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
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

        {/* Quick Filters Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1.5 rounded-full border text-[13px] font-medium whitespace-nowrap transition-colors ${
                activeFilters.includes(filter)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:bg-muted"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Categories Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {MOCK_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground font-medium">Filtros activos:</span>
          {activeFilters.map((filter) => (
            <div
              key={filter}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-sm text-xs font-medium"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="hover:text-primary transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline font-medium ml-2"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Counter */}
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        {filteredEvents.length}{" "}
        {filteredEvents.length === 1 ? "evento encontrado" : "eventos encontrados"}
      </div>

      {/* Conditional Featured Event (hidden when filtering) */}
      {!isFilteringActive && MOCK_EVENTS.length > 0 && (
        <div className="mt-2">
          <FeaturedEvent event={MOCK_EVENTS[0]} />
        </div>
      )}

      {/* Event List */}
      <div className="flex flex-col gap-5 mt-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="text-center py-10 bg-card rounded-sm border border-[#c2c9d6]">
            <p className="text-muted-foreground font-medium text-lg mb-1">
              No se han encontrado eventos.
            </p>
            <p className="text-muted-foreground text-sm">
              Prueba a cambiar los filtros o la búsqueda.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
