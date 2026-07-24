import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Star, Calendar as CalendarIcon, Users, CalendarDays, PlusCircle } from "lucide-react";
import { Route } from "@/routes/_authenticated/eventos/route";

export function LeftSidebar() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const activeCategory = search.category || "Todos";
  const [activeFilter, setActiveFilter] = useState("Próximos 7 días");

  const handleCategoryChange = (category: string) => {
    navigate({
      to: "/eventos",
      search: { category },
    });
  };

  return (
    <aside className="space-y-6 hidden lg:block w-full">
      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-4 flex flex-col gap-1 shadow-sm">
        <MenuLink icon={Star} label="Eventos destacados" to="/eventos" exact />
        <MenuLink icon={CalendarIcon} label="Mis eventos" to="/eventos/mis-eventos" />
        <MenuLink icon={Users} label="Amigos que van" to="/eventos/amigos" />
        <MenuLink icon={CalendarDays} label="Calendario" to="/eventos/calendario" />
        <MenuLink icon={PlusCircle} label="Crear evento" to="/eventos/crear" />
      </div>

      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-4 shadow-sm">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase mb-3">Categorías</h4>
        <div className="flex flex-col gap-1">
          {[
            "Conciertos",
            "Festivales",
            "Fiestas",
            "Teatro",
            "Deportes",
            "Arte y cultura",
            "Otros",
          ].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors text-left ${
                activeCategory === category
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-4 shadow-sm">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase mb-3">
          Filtros rápidos
        </h4>
        <div className="flex flex-col gap-1">
          {["Este fin de semana", "Próximos 7 días", "Próximo mes", "Personalizados"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors text-left ${
                  activeFilter === filter
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                {filter}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="bg-card rounded-[16px] border border-[#c2c9d6] p-6 text-center flex flex-col items-center shadow-sm relative overflow-hidden">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary relative z-10">
          <CalendarIcon className="size-6" />
        </div>
        <h4 className="text-[16px] font-extrabold text-foreground mb-1 relative z-10">
          ¿Organizas eventos?
        </h4>
        <p className="text-[13px] text-muted-foreground mb-5 relative z-10">
          Crea tu propio evento y llega a miles de personas en Inkorium.
        </p>
        <Link
          to="/eventos/crear"
          className="w-full bg-primary text-primary-foreground font-bold text-[14px] py-3 rounded-[12px] transition-colors hover:bg-primary/90 flex justify-center relative z-10 shadow-sm"
        >
          Crear evento
        </Link>
      </div>
    </aside>
  );
}

function MenuLink({
  icon: Icon,
  label,
  to,
  exact,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      activeProps={{ className: "bg-primary/10 text-primary font-bold text-[13px]" }}
      inactiveProps={{ className: "hover:bg-secondary/50 text-foreground font-medium text-[13px]" }}
      className="flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] transition-colors justify-between text-left"
    >
      {({ isActive }) => (
        <div className="flex items-center gap-3.5">
          <Icon className={`size-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`} />
          {label}
        </div>
      )}
    </Link>
  );
}
