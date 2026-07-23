import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LeftSidebar } from "@/components/events/LeftSidebar";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { EventCard } from "@/components/events/EventCard";
import { RightSidebar } from "@/components/events/RightSidebar";
import { MOCK_EVENTS, MOCK_CATEGORIES } from "@/components/events/types";

export const Route = createFileRoute("/_authenticated/eventos")({
  component: EventosPage,
});

function EventosPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-[30px] py-4 w-full">
      <LeftSidebar />

      <div className="flex flex-col gap-6 min-w-0">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Eventos</h1>
          <p className="text-muted-foreground text-[15px]">
            Descubre conciertos, festivales y actividades cerca de ti.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {MOCK_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
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

        <div className="mt-2">
          <FeaturedEvent event={MOCK_EVENTS[0]} />
        </div>

        <div className="flex flex-col gap-5 mt-4">
          {MOCK_EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      <RightSidebar />
    </main>
  );
}
