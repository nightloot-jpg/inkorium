import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { EventCard } from "@/components/events/EventCard";
import { MOCK_EVENTS, MOCK_CATEGORIES } from "@/components/events/types";
import { Route } from "@/routes/_authenticated/eventos/route";

export function FeaturedEventsView() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const activeCategory = search.category || "Todos";

  const handleCategoryChange = (category: string) => {
    navigate({
      to: "/eventos",
      search: { category },
    });
  };

  const filteredEvents =
    activeCategory === "Todos"
      ? MOCK_EVENTS
      : MOCK_EVENTS.filter((event) => event.category === activeCategory);

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

      {activeCategory === "Todos" && MOCK_EVENTS.length > 0 && (
        <div className="mt-2">
          <FeaturedEvent event={MOCK_EVENTS[0]} />
        </div>
      )}

      <div className="flex flex-col gap-5 mt-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="text-center py-10 bg-card rounded-sm border border-[#c2c9d6]">
            <p className="text-muted-foreground font-medium">
              No hay eventos en la categoría {activeCategory}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
