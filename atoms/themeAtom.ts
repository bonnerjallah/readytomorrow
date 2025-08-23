import { atom } from "jotai";

// Explicitly type it: "light" | "dark" | null
export const themeAtom = atom<"light" | "dark" | null>(null);
