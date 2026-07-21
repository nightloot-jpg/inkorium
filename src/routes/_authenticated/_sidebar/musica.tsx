import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_sidebar/musica")({
  component: MusicaPage,
});

function MusicaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 text-center">
        <h2 className="text-xl font-bold text-primary mb-2">Música</h2>
        <p className="text-muted-foreground text-sm">
          Esta sección está en construcción. Pronto podrás disfrutar de esta nueva funcionalidad.
        </p>
      </div>
    </div>
  );
}
