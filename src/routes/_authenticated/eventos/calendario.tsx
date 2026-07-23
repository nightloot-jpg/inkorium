import { createFileRoute } from "@tanstack/react-router";
import { CalendarView } from "@/components/events/views/CalendarView";

export const Route = createFileRoute("/_authenticated/eventos/calendario")({
  component: CalendarView,
});
