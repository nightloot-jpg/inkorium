import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({

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
  // We default to signup since the screenshot shows the signup form
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup" && password !== repeatPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: email.split("@")[0] },
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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl font-bold text-[#4295e4] mb-8 tracking-wide">INKORIUM</h1>

      <div className="bg-card border border-border rounded-sm p-8 w-full max-w-md shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-input border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full bg-input border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-muted-foreground"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label
                htmlFor="repeatPassword"
                className="block text-sm font-medium text-card-foreground"
              >
                Repetir contraseña
              </label>
              <input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-input border border-border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-muted-foreground"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4295e4] hover:bg-[#317bc2] text-white font-medium rounded-lg px-4 py-2.5 mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setPassword("");
            setRepeatPassword("");
          }}
          className="font-medium text-[#4295e4] hover:underline focus:outline-none"
        >
          {mode === "login" ? "Crea una cuenta" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}
