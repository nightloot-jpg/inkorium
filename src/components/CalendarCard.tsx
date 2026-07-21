import React from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  X,
  Clock,
  MapPin,
  AlignLeft,
  Type,
  CalendarDays,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarCard({ userId }: { userId: string }) {
  const qc = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  React.useEffect(() => setDate(new Date()), []);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!name || !date) throw new Error("Faltan campos obligatorios");

      // Format date to DD/MM/YYYY
      const formattedDate = [
        String(date.getDate()).padStart(2, "0"),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getFullYear(),
      ].join("/");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        author_id: userId,
        content: `Evento: ${name} | ${formattedDate} ${time} | ${location} | ${description}`.trim(),
      };
      const { error: evtErr } = await supabase.from("posts").insert(payload);

      if (evtErr) throw evtErr;
    },
    onSuccess: () => {
      setName("");
      setDate(undefined);
      setTime("");
      setLocation("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Evento creado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error creando evento"),
  });

  return (
    <section className="bg-card rounded-sm border border-[#c2c9d6] p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          CALENDARIO
        </h4>
        <CalendarIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="bg-white rounded-sm border border-transparent p-1 relative">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            modifiers={{
              hasEvent: date
                ? [
                    new Date(date.getFullYear(), date.getMonth(), 15),
                    new Date(date.getFullYear(), date.getMonth(), 22),
                  ]
                : [],
            }}
            modifiersClassNames={{
              hasEvent: "has-event",
            }}
          />
        </div>

        {date && (
          <div className="mt-4 px-2 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                NUEVO EVENTO
              </span>
              <button
                onClick={() => {
                  setDate(undefined);
                  setName("");
                  setTime("");
                  setLocation("");
                  setDescription("");
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Title Input */}
              <div className="relative">
                <Type className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Título del evento"
                  className="w-full bg-[#f6f7f9] rounded-sm pl-10 pr-3 py-2 text-[13px] outline-none border border-transparent focus:border-border focus:ring-0 placeholder:text-muted-foreground"
                />
              </div>

              {/* Date & Time Row */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <div className="w-full bg-[#f6f7f9] rounded-sm pl-10 pr-3 py-2 text-[13px] text-foreground outline-none border border-transparent">
                    {date.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#f6f7f9] rounded-sm pl-10 pr-3 py-2 text-[13px] outline-none border border-transparent focus:border-border focus:ring-0 text-foreground"
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lugar"
                  className="w-full bg-[#f6f7f9] rounded-sm pl-10 pr-3 py-2 text-[13px] outline-none border border-transparent focus:border-border focus:ring-0 placeholder:text-muted-foreground"
                />
              </div>

              {/* Description Textarea */}
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del evento"
                  rows={3}
                  className="w-full bg-[#f6f7f9] rounded-sm pl-10 pr-3 py-2.5 text-[13px] outline-none border border-transparent focus:border-border focus:ring-0 placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => createEvent.mutate()}
                disabled={createEvent.isPending || !name}
                className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold py-2.5 rounded-sm transition-colors disabled:opacity-50 text-[14px]"
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
