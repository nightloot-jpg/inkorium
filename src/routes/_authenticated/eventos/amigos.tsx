import { createFileRoute } from "@tanstack/react-router";
import { FriendsAttendingView } from "@/components/events/views/FriendsAttendingView";

export const Route = createFileRoute("/_authenticated/eventos/amigos")({
  component: FriendsAttendingView,
});
