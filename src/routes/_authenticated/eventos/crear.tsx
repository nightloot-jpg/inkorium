import { createFileRoute } from "@tanstack/react-router";
import { CreateEventView } from "@/components/events/views/CreateEventView";

export const Route = createFileRoute("/_authenticated/eventos/crear")({
  component: CreateEventView,
});
