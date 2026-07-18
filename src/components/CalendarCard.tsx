import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";

export function CalendarCard({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !name || !time) throw new Error("Faltan campos obligatorios");

      const dateStr = format(selectedDate, "yyyy-MM-dd");

      const { data: evt, error: evtErr } = await supabase
        .from("events")
        .insert({
          author_id: userId,
          name: name,
          event_date: dateStr,
          event_time: time,
          location: location,
          description: description,
        })
        .select()
        .single();

      if (evtErr) throw evtErr;

      // also create a post for it
      const { error: postErr } = await supabase.from("posts").insert({
        author_id: userId,
        type: "event",
        content: description,
        event_id: evt.id,
      });
      if (postErr) throw postErr;
    },
    onSuccess: () => {
      setShowModal(false);
      setName("");
      setTime("");
      setLocation("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Evento creado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error creando evento"),
  });

  return (
    <>
      <section className="bg-card p-3 rounded-2xl ring-1 ring-border shadow-card">
        <h4 className="text-[13px] font-bold text-[#2F5FA7] mb-3 border-b border-border pb-2">
          Calendario
        </h4>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setShowModal(true);
              }
            }}
            locale={es}
          />
        </div>
      </section>

      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl ring-1 ring-border shadow-2xl w-full max-w-md p-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold text-[#2F5FA7] mb-4">
              Crear evento - {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h3>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del evento"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5FA7]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5FA7]"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lugar"
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5FA7]"
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del evento..."
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5FA7] min-h-[80px] resize-none"
              />

              <button
                onClick={() => createEvent.mutate()}
                disabled={createEvent.isPending || !name || !time}
                className="w-full bg-[#2F5FA7] hover:bg-[#264d87] text-white font-bold py-2 rounded-lg mt-2 transition-colors disabled:opacity-50"
              >
                Guardar y Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
