import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";

export function CalendarCard({ userId }: { userId: string }) {
  const qc = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!name || !date) throw new Error("Faltan campos obligatorios");

      const payload: any = {
        author_id: userId,
        content: name + " " + date + " " + location,
      };
      const { data: evt, error: evtErr } = await supabase
        .from("posts")
        .insert(payload)
        .select()
        .single();

      if (evtErr) throw evtErr;
    },
    onSuccess: () => {
      setName("");
      setDate("");
      setLocation("");
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Evento creado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error creando evento"),
  });

  return (
    <section className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card mt-4">
      <div className="flex items-center justify-between mb-4 pb-2">
        <h4 className="text-[13px] font-bold text-foreground uppercase">CALENDARIO</h4>
        <CalendarIcon className="size-4 text-[#2F5FA7]" />
      </div>

      <div className="bg-[#f8f9fc] rounded-xl p-3 border border-border">
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nuevo evento"
            className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7]"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7] text-muted-foreground"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lugar"
            className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-border focus:ring-2 focus:ring-[#2F5FA7]"
          />

          <button
            onClick={() => createEvent.mutate()}
            disabled={createEvent.isPending || !name || !date}
            className="w-full bg-[#91a8cc] hover:bg-[#2F5FA7] text-white font-bold py-2 rounded-lg mt-1 transition-colors disabled:opacity-50"
          >
            Crear evento
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Aún no hay eventos.</p>
    </section>
  );
}
