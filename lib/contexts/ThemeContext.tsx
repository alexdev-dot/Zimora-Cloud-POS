"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Routes that should always be in light mode
const LIGHT_MODE_ROUTES = ["/", "/privacy-policy", "/terms-of-use"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  // Check if current route should be forced to light mode
  const isLightModeRoute = LIGHT_MODE_ROUTES.includes(pathname);

  // Initialize theme - always default to light mode
  React.useEffect(() => {
    // Always default to light mode, ignore localStorage for initial load
    const initialTheme: Theme = "light";
    setTheme(initialTheme);

    // Apply theme to DOM immediately
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);

    setMounted(true);
  }, []);

  // Update DOM and localStorage when theme changes
  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    // Force light mode for specific routes
    if (isLightModeRoute) {
      root.classList.add("light");
    } else {
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted, isLightModeRoute]);

  const toggleTheme = () => {
    // Don't allow theme toggle on light mode routes
    if (isLightModeRoute) return;
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent hydration mismatch by rendering children immediately
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
