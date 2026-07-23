import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, Calendar as CalendarIcon, Users, CalendarDays, PlusCircle } from "lucide-react";
import { MOCK_CATEGORIES } from "./types";

export function LeftSidebar() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeFilter, setActiveFilter] = useState("Próximos 7 días");

  return (
    <aside className="space-y-4 hidden lg:block w-full">
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex flex-col gap-1">
        <MenuLink icon={Star} label="Eventos destacados" />
        <MenuLink icon={CalendarIcon} label="Mis eventos" />
        <MenuLink icon={Users} label="Amigos que asistirán" />
        <MenuLink icon={CalendarDays} label="Calendario" />
        <MenuLink icon={PlusCircle} label="Crear evento" />
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase mb-3">Categorías</h4>
        <div className="flex flex-col gap-1">
          {MOCK_CATEGORIES.slice(1, 11).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                activeCategory === category
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              {category}
            </button>
          ))}
          <button className="flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium text-foreground hover:bg-secondary/50 transition-colors text-left">
            Más categorías
          </button>
        </div>
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase mb-3">Filtros</h4>
        <div className="flex flex-col gap-1">
          {[
            "Hoy",
            "Este fin de semana",
            "Próximos 7 días",
            "Próximo mes",
            "Gratis",
            "Cerca de mí",
            "Personalizados",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                activeFilter === filter
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 text-center flex flex-col items-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary">
          <CalendarIcon className="size-5" />
        </div>
        <h4 className="text-[14px] font-bold text-foreground mb-1">¿Organizas eventos?</h4>
        <p className="text-[13px] text-muted-foreground mb-4">Crea un evento en Inkorium.</p>
        <button className="w-full bg-primary text-primary-foreground font-bold text-[13px] py-2 rounded transition-colors hover:bg-primary/90">
          Crear evento
        </button>
      </div>
    </aside>
  );
}

function MenuLink({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-3.5 px-3 py-2 rounded transition-colors justify-between text-left ${
        active
          ? "bg-primary/10 text-primary font-bold text-[13px]"
          : "hover:bg-secondary/50 text-foreground font-medium text-[13px]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <Icon className={`size-[18px] ${active ? "text-primary" : "text-muted-foreground"}`} />
        {label}
      </div>
    </button>
  );
}
