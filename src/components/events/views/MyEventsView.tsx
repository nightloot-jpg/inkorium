import React from "react";
import { EventCard } from "@/components/events/EventCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function MyEventsView() {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;
        toast.success("Evento eliminado correctamente");
        queryClient.invalidateQueries({ queryKey: ["my-events"] });
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar el evento");
      }
    }
  };

  const { data: savedEvents = [] } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*, creator:profiles!events_author_id_fkey(*)")
        .eq("author_id", session.user.id);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mis eventos</h1>
        <p className="text-muted-foreground text-[15px]">
          Eventos a los que asistes o te interesan.
        </p>
      </div>

      {savedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedEvents.map((event) => (
            <div key={event.id} className="relative">
              <EventCard event={event} variant="important" />
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Link to={`/eventos/editar/${event.id}` as any}>
                  <Button variant="secondary" size="sm" className="h-8">
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  onClick={() => handleDelete(event.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center">
          <p className="text-muted-foreground font-medium">Aún no tienes eventos guardados.</p>
        </div>
      )}
    </>
  );
}
