import { createContext, useContext, useMemo } from "react";
import { useAtom } from "jotai";
import { themeAtom } from "../atoms/themeAtom";
import { Colors, ColorScheme } from "../constant/Colors";
import { useColorScheme } from "react-native";

// ---- TYPES ----
type ThemeContextType = {
  theme: typeof Colors.light | typeof Colors.dark;
  darkMode: ColorScheme | null;
  setDarkmode: (scheme: ColorScheme | null) => void;
};

// ---- CONTEXT ----
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ---- PROVIDER ----
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() as ColorScheme | null; // "light" | "dark" | null
  const [darkMode, setDarkmode] = useAtom(themeAtom);

  // Ensure fallback
  const currentMode: ColorScheme = darkMode ?? systemScheme ?? "light";

  const theme = useMemo(() => Colors[currentMode], [currentMode]);

  return (
    <ThemeContext.Provider value={{ theme, darkMode: currentMode, setDarkmode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ---- HOOK ----
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
