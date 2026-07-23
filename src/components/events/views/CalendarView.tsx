import React from "react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarView() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Calendario</h1>
        <p className="text-muted-foreground text-[15px]">Explora eventos por fecha.</p>
      </div>
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex justify-center">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
      </div>
    </>
  );
}
