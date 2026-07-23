import React from "react";

export function CreateEventView() {
  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Crear evento</h1>
        <p className="text-muted-foreground text-[15px]">
          Organiza tu propio evento e invita a la comunidad.
        </p>
      </div>
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
        <p className="text-muted-foreground font-medium">
          El formulario de creación de eventos estará disponible pronto.
        </p>
      </div>
    </>
  );
}
