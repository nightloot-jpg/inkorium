import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarCard({ userId }: { userId: string }) {
  const qc = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");

  const createEvent = useMutation({
    mutationFn: async () => {
      // Allow accepting without a name/location if the UI just says "Aceptar" for dates,
      // but if creating an event is the goal, we can keep the fields.
      // Based on the image, there's just an "Aceptar" button under the calendar.
      // To not break existing functionality while matching the UI,
      // we can show the calendar and an "Aceptar" button. If they want to add an event,
      // we can keep the inputs but style the button to say "Aceptar" and be fully black.

      if (!name || !date) throw new Error("Faltan campos obligatorios");

      // Format date to YYYY-MM-DD
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        author_id: userId,
        content: name + " " + formattedDate + " " + location,
      };
      const { error: evtErr } = await supabase.from("posts").insert(payload);

      if (evtErr) throw evtErr;
    },
    onSuccess: () => {
      setName("");
      setDate(undefined);
      setLocation("");
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Evento creado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error creando evento"),
  });

  return (
    <section className="bg-card p-4 rounded-3xl ring-1 ring-border shadow-card mt-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[14px] font-bold text-foreground">Calendario</h4>
        <CalendarIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="bg-white rounded-2xl border border-transparent p-1 relative">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            modifiers={{
              hasEvent: [
                new Date(new Date().getFullYear(), new Date().getMonth(), 15),
                new Date(new Date().getFullYear(), new Date().getMonth(), 22),
              ], // Placeholder for dots in the UI as seen in the photo
            }}
            modifiersClassNames={{
              hasEvent: "has-event",
            }}
          />
        </div>

        {date && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center px-4 py-2 z-10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setDate(undefined);
                setName("");
                setLocation("");
              }}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <div className="text-center mb-4">
              <span className="text-[14px] font-medium text-foreground">
                {date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
              </span>
            </div>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del evento (Opcional)"
                className="w-full bg-white rounded-lg px-3 py-2 text-[13px] outline-none border border-border focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lugar (Opcional)"
                className="w-full bg-white rounded-lg px-3 py-2 text-[13px] outline-none border border-border focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  if (name) {
                    createEvent.mutate();
                  } else {
                    toast.success(`Día ${date.toLocaleDateString()} seleccionado`);
                    setDate(undefined);
                  }
                }}
                disabled={createEvent.isPending}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-[14px]"
              >
                {createEvent.isPending ? "Procesando..." : "Crear evento"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
