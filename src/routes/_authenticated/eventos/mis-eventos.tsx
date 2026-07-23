import { createFileRoute } from "@tanstack/react-router";
import { MyEventsView } from "@/components/events/views/MyEventsView";

export const Route = createFileRoute("/_authenticated/eventos/mis-eventos")({
  component: MyEventsView,
});
