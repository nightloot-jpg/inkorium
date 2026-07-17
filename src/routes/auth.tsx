import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    <div className="min-h-screen bg-[#10161b] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      <h1 className="text-4xl font-bold text-[#4295e4] mb-8 tracking-wide">INKORIUM</h1>

      <div className="bg-[#1f2937] border border-slate-700/50 rounded-xl p-8 w-full max-w-md shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-[#111827] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full bg-[#111827] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-slate-500"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="repeatPassword" className="block text-sm font-medium text-slate-200">
                Repetir contraseña
              </label>
              <input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-[#111827] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4295e4] focus:ring-1 focus:ring-[#4295e4] transition-colors placeholder:text-slate-500"
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

      <p className="mt-8 text-sm text-slate-400">
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
