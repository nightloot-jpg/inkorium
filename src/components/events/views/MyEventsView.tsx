import React from "react";

export function MyEventsView() {
  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mis eventos</h1>
        <p className="text-muted-foreground text-[15px]">
          Eventos a los que asistes o te interesan.
        </p>
      </div>
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
        <p className="text-muted-foreground font-medium">Aún no tienes eventos guardados.</p>
      </div>
    </>
  );
}
