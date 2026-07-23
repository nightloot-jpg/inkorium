import React from "react";

export function FriendsAttendingView() {
  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Amigos que asistirán
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Descubre a dónde van tus amigos próximamente.
        </p>
      </div>
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
        <p className="text-muted-foreground font-medium">No hay eventos próximos de tus amigos.</p>
      </div>
    </>
  );
}
