import { createFileRoute } from "@tanstack/react-router";
import { FeaturedEventsView } from "@/components/events/views/FeaturedEventsView";

export const Route = createFileRoute("/_authenticated/eventos/")({
  component: FeaturedEventsView,
});
