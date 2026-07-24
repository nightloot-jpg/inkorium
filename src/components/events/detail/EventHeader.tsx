import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route as AuthRoute } from "@/routes/_authenticated/route";
import { toast } from "sonner";
import { Share, Bookmark, MapPin, Clock, Heart, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Edit } from "lucide-react";

interface EventHeaderProps {
  event: any; // Using any for now until we fully type the supabase event
  organizer: any;
  attendeesCount: number;
}

export function EventHeader({ event, organizer, attendeesCount }: EventHeaderProps) {
  const queryClient = useQueryClient();
  const auth = AuthRoute.useRouteContext();
  const currentUserId = auth.userId;

  // State is now managed via react-query data, but we can keep local state for optimistic updates
  const { data: userStatus } = useQuery({
    queryKey: ["event_status", event.id, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { status: null, saved: false };

      const { data: attData } = await supabase
        .from("event_attendees")
        .select("status")
        .eq("event_id", event.id)
        .eq("user_id", currentUserId)
        .maybeSingle();

      const { data: savedData } = await supabase
        .from("saved_events")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", currentUserId)
        .maybeSingle();

      return {
        status: attData?.status || null,
        saved: !!savedData,
      };
    },
    enabled: !!currentUserId && !!event.id,
  });

  const [isInterested, setIsInterested] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (userStatus) {
      setIsInterested(userStatus.status === "interested");
      setIsAttending(userStatus.status === "attending");
      setIsSaved(userStatus.saved);
    }
  }, [userStatus]);

  const toggleStatusMutation = useMutation({
    mutationFn: async (status: "attending" | "interested" | null) => {
      if (!currentUserId) throw new Error("Not authenticated");

      if (status === null) {
        await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", currentUserId);
      } else {
        const { error } = await supabase.from("event_attendees").upsert(
          {
            event_id: event.id,
            user_id: currentUserId,
            status: status,
          },
          { onConflict: "event_id,user_id" },
        );

        if (error) throw error;
      }
    },
    onMutate: async (status) => {
      setIsInterested(status === "interested");
      setIsAttending(status === "attending");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_status", event.id, currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["event", event.id] });
    },
    onError: () => {
      toast.error("Error al actualizar el estado");
      // Revert optimistic update
      if (userStatus) {
        setIsInterested(userStatus.status === "interested");
        setIsAttending(userStatus.status === "attending");
      }
    },
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      if (!currentUserId) throw new Error("Not authenticated");

      if (!save) {
        await supabase
          .from("saved_events")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("saved_events").insert({
          event_id: event.id,
          user_id: currentUserId,
        });
      }
    },
    onMutate: async (save) => {
      setIsSaved(save);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_status", event.id, currentUserId] });
    },
    onError: () => {
      toast.error("Error al guardar el evento");
      setIsSaved(userStatus?.saved || false);
    },
  });

  const handleInterest = () => {
    toggleStatusMutation.mutate(isInterested ? null : "interested");
  };

  const handleAttend = () => {
    toggleStatusMutation.mutate(isAttending ? null : "attending");
  };

  const handleSave = () => {
    toggleSaveMutation.mutate(!isSaved);
  };

  const dateObj = new Date(event.event_date || new Date());
  // event.event_date is likely a string like "2026-10-15"
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("es-ES", { month: "short" });

    const getImageUrl = (urlOrPath: string) => {
    if (!urlOrPath) return "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3";
    if (urlOrPath.startsWith('http')) return urlOrPath;
    return "https://wzscbqxawivhndwexqqn.supabase.co/storage/v1/object/public/media/" + urlOrPath;
  };
  const coverUrl = getImageUrl(event.cover_url || event.cover);

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden flex flex-col shadow-sm">
      <div className="w-full h-[300px] relative">
        <img
          src={coverUrl}
          alt={event.name || "Evento sin título"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center bg-background text-foreground shadow-md rounded-sm w-[60px] h-[65px] border border-border">
          <span className="text-[26px] font-extrabold leading-none text-primary">{day}</span>
          <span className="text-[13px] font-bold uppercase">{month}</span>
        </div>
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-sm text-[14px] font-medium">
          {event.category || "Categoría"}
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col">
        <h1 className="text-3xl font-extrabold text-foreground mb-4">
          {event.name || "Evento sin título"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <MapPin className="size-5 text-muted-foreground shrink-0" />
            <span>
              {event.location || event.city || "Sin ubicación"}
              {event.location && event.city ? `, ${event.city}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Clock className="size-5 text-muted-foreground shrink-0" />
            <span>{event.event_time || "Hora pendiente"}</span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Users className="size-5 text-muted-foreground shrink-0" />
            <span>{attendeesCount} asistentes</span>
          </div>
          <div className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <span className="font-bold text-foreground">
              Precio: {event.price ? `${event.price}€` : "Gratis"}
            </span>
            {organizer && (
              <span className="border-l pl-3 border-border/50">
                Por{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  {organizer.display_name}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2 border-t border-border/50 pt-6">

          {currentUserId === event.author_id && (
            <Link
              to="/eventos/editar/$id"
              params={{ id: event.id }}
              className="flex-1 md:flex-none"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11 px-6 rounded-sm bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20 font-bold"
              >
                <Edit className="size-4" />
                Editar Evento
              </Button>
            </Link>
          )}

          <Button
            onClick={handleInterest}
            variant="outline"
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold h-11 px-6 rounded-sm ${
              isInterested
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
            }`}
          >
            <Heart className={`size-4 ${isInterested ? "fill-current" : ""}`} />
            Me interesa
          </Button>

          <Button
            onClick={handleAttend}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 font-bold h-11 px-6 rounded-sm ${
              isAttending
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {isAttending ? <Check className="size-4" /> : <Users className="size-4" />}
            Asistiré
          </Button>

          <Button
            variant="outline"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-sm"
          >
            <Share className="size-4" />
            Compartir
          </Button>

          <Button
            onClick={handleSave}
            variant="outline"
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-sm ${isSaved ? "text-primary border-primary/50" : ""}`}
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
