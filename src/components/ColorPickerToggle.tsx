import { Palette } from "lucide-react";
import { useAccentColor, type AccentColor } from "@/hooks/useAccentColor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ColorPickerToggle() {
  const { accentColor, setAccentColor } = useAccentColor();

  const colors: { name: string; value: AccentColor; hex: string }[] = [
    { name: "Azul (Original)", value: "blue", hex: "#084093" },
    { name: "Morado eléctrico", value: "purple", hex: "#7c3aed" },
    { name: "Magenta", value: "magenta", hex: "#db2777" },
    { name: "Naranja", value: "orange", hex: "#ea580c" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors border border-white/10"
          title="Cambiar color de acento"
        >
          <Palette className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card text-foreground">
        {colors.map((c) => (
          <DropdownMenuItem
            key={c.value}
            onClick={() => setAccentColor(c.value)}
            className="flex items-center gap-2 cursor-pointer hover:bg-muted"
          >
            <div
              className="size-4 rounded-full border border-black/10 shadow-inner"
              style={{ backgroundColor: c.hex }}
            />
            <span className={accentColor === c.value ? "font-bold" : ""}>{c.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
