import { useEffect, useState } from "react";

export type AccentColor = "blue" | "purple" | "magenta" | "orange";

export function useAccentColor() {
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("accentColor");
      if (stored === "blue" || stored === "purple" || stored === "magenta" || stored === "orange") {
        return stored;
      }
    }
    return "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove previous theme classes
    root.classList.remove("theme-purple", "theme-magenta", "theme-orange");

    if (accentColor !== "blue") {
      root.classList.add(`theme-${accentColor}`);
    }

    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  return { accentColor, setAccentColor };
}
