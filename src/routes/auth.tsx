import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar a Inkorium" },
      { name: "description", content: "Entra o crea tu cuenta en Inkorium." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Ya estás dentro.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/feed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo ha ido mal";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo - marca */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Inkorium</h1>
          <p className="mt-2 text-primary-foreground/70 text-sm">
            La red social para reencontrarte
          </p>
        </div>
        <div className="space-y-6">
          <p className="text-3xl font-medium leading-tight text-balance max-w-md">
            Comparte tu día, encuentra a tus amigos y chatea en privado.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/70">
            <div>
              <div className="text-2xl font-semibold text-primary-foreground">12k</div>
              usuarios
            </div>
            <div>
              <div className="text-2xl font-semibold text-primary-foreground">80k</div>
              publicaciones
            </div>
            <div>
              <div className="text-2xl font-semibold text-primary-foreground">∞</div>
              amistades
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-semibold tracking-tighter text-primary">Inkorium</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entra con tu email y contraseña."
              : "Únete a Inkorium en 30 segundos."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="display_name">Nombre a mostrar</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Carlos Ruiz"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Un momento..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? "Regístrate" : "Entra"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
