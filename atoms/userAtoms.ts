import { atomWithStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppUser {
  id: string;
  email: string | null;
  createdAt?: Date;
  [key: string]: any; // extra fields
}

const asyncStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      const parsed: AppUser = JSON.parse(value);
      if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
      return parsed;
    } catch (e) {
      console.error("Error reading AsyncStorage:", key, e);
      return null;
    }
  },
  setItem: async (key: string, value: AppUser | null) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error setting AsyncStorage:", key, e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing AsyncStorage:", key, e);
    }
  },
};

export const userAtom = atomWithStorage<AppUser | null>(
  "user",
  null,
  {
    getItem: asyncStorage.getItem,
    setItem: asyncStorage.setItem,
    removeItem: asyncStorage.removeItem,
  }
);
