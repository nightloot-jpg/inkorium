import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import { LeftSidebar } from "@/components/events/LeftSidebar";
import { RightSidebar } from "@/components/events/RightSidebar";

const eventsSearchSchema = z.object({
  category: z.string().optional().default("Todos"),
});

export const Route = createFileRoute("/_authenticated/eventos")({
  validateSearch: eventsSearchSchema,
  component: EventosLayout,
});

function EventosLayout() {
  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-[30px] py-4 w-full">
      <LeftSidebar />
      <div className="flex flex-col gap-6 min-w-0">
        <Outlet />
      </div>
      <RightSidebar />
    </main>
  );
}
