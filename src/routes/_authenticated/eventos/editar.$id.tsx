import { createFileRoute } from "@tanstack/react-router";
import { CreateEventView } from "@/components/events/views/CreateEventView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// @ts-ignore
export const Route = createFileRoute("/_authenticated/eventos/editar/$id")({
  component: EditarEventoPage,
});

function EditarEventoPage() {
  // @ts-ignore
  const { id } = Route.useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando evento...</div>;
  }

  if (!event) {
    return <div className="p-8 text-center text-muted-foreground">Evento no encontrado.</div>;
  }

  return <CreateEventView existingEvent={event} />;
}
