import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarCard({ userId }: { userId: string }) {
  const qc = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");

  const createEvent = useMutation({
    mutationFn: async () => {
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
    <section className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card mt-4">
      <div className="flex items-center justify-between mb-4 pb-2">
        <h4 className="text-[13px] font-bold text-foreground uppercase tracking-wide">
          CALENDARIO
        </h4>
        <CalendarIcon className="size-4 text-[#2F5FA7]" />
      </div>

      <div className="bg-[#f8f9fc] rounded-xl p-3 border border-border">
        <div className="mb-4 flex justify-center bg-white rounded-lg p-2 border border-border">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
        </div>

        {date && (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nuevo evento"
              className="w-full bg-white rounded-lg px-3 py-2 text-[13px] outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7] placeholder:text-muted-foreground/70"
            />
            <div className="relative">
              <input
                type="text"
                readOnly
                value={
                  date
                    ? date.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""
                }
                placeholder="dd/mm/aaaa"
                className="w-full bg-white rounded-lg px-3 py-2 text-[13px] outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7] placeholder:text-muted-foreground/70"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lugar"
              className="w-full bg-white rounded-lg px-3 py-2 text-[13px] outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7] placeholder:text-muted-foreground/70"
            />

            <button
              onClick={() => createEvent.mutate()}
              disabled={createEvent.isPending || !name || !date}
              className="w-full bg-[#91a8cc] hover:bg-[#2F5FA7] text-white font-bold py-2 rounded-lg mt-1 transition-colors disabled:opacity-50 text-[14px]"
            >
              {createEvent.isPending ? "Creando..." : "Crear evento"}
            </button>
          </div>
        )}
      </div>
      {!date && (
        <p className="text-[13px] text-muted-foreground mt-4">
          Selecciona un día para crear un evento.
        </p>
      )}
    </section>
  );
}
