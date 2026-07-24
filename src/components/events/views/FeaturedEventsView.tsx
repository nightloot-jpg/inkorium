import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
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

function HeroCarousel({ events, navigate }: { events: any[]; navigate: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  const event = events[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % events.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-[16px] overflow-hidden group">
      {events.map((ev, idx) => (
        <div
          key={ev.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={
              ev.cover_url || ev.cover ||
              "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3"
            }
            alt={ev.name || ev.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col items-start text-white">
            {ev.category && (
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-[8px] text-[12px] font-bold mb-4">
                {ev.category}
              </span>
            )}

            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-md">
              {ev.name || ev.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-white/90 text-[14px] font-medium mb-6">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                <span>{ev.city || "Ciudad"}</span>
                {ev.location && (
                  <span className="opacity-60 hidden sm:inline"> • {ev.location}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span>21:00</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/150?u=${ev.id}${i}`}
                      alt="Attendee"
                      className="w-9 h-9 rounded-full border-2 border-black object-cover"
                    />
                  ))}
                </div>
                <span className="text-[13px] font-medium text-white/80">
                  <strong className="text-white">{ev.attendeesCount || 24}</strong> amigos asisten
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 py-3 rounded-[12px] text-[14px] font-bold bg-white/10 hover:bg-white/20 backdrop-blur transition-all text-white border border-white/20">
                  Me interesa
                </button>
                <button
                  onClick={() => navigate({ to: `/eventos/${ev.slug || ev.id}` })}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-[12px] text-[14px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg"
                >
                  Ver evento
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {events.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-all border border-white/10"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-all border border-white/10"
          >
            <ChevronRight className="size-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
          creator:profiles!events_author_id_fkey(*),
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
          author_name: (event.creator as any)?.name || event.organizer_name || "Desconocido",
          author_avatar: (event.creator as any)?.avatar_url || "https://github.com/shadcn.png",
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
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto xl:mx-0">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-[32px] sm:text-[40px] font-extrabold text-foreground tracking-tight leading-tight">
          Eventos destacados
        </h1>
        <p className="text-muted-foreground text-[16px] font-medium">
          Descubre los mejores conciertos, festivales y actividades cerca de ti.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          "Todos",
          "Conciertos",
          "Festivales",
          "Fiestas",
          "Teatro",
          "Deportes",
          "Arte y cultura",
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => navigate({ to: "/eventos", search: { ...searchParams, category: cat } })}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors border ${
              activeCategory === cat ||
              (cat === "Todos" && (!activeCategory || activeCategory === "Todos"))
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-[16px] border border-[#c2c9d6] shadow-sm">
          <p className="text-foreground font-bold text-xl mb-2">No se han encontrado eventos.</p>
          <p className="text-muted-foreground text-[15px]">
            Prueba a cambiar los filtros o explora otras categorías.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <HeroCarousel events={filteredEvents.slice(0, 4)} navigate={navigate} />

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-extrabold text-foreground">Próximos eventos</h2>
              <button className="text-[14px] font-bold text-primary hover:underline">
                Ver todos
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {filteredEvents.slice(4).map((event) => (
                <EventCard key={event.id} event={event} variant="horizontal" />
              ))}
              {/* Fallback to horizontal variant for the first events if we don't have many */}
              {filteredEvents.length <= 4 &&
                filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="horizontal" />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
