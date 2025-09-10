import { atomWithStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define AppUser type
export interface AppUser {
  id: string;
  email: string | null;
  createdAt?: Date
  [key: string]: any; // ✅ allows extra fields like settings
}

// AsyncStorage wrapper
const asyncStorage = {

  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
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

// Atom to persist AppUser (not the raw Firebase.User)
export const userAtom = atomWithStorage<AppUser | null>("user", null, {
  getItem: async (key) => {
    const value = await asyncStorage.getItem(key);
    if (value) {
      // Convert createdAt string back to Date
      value.createdAt = new Date(value.createdAt);
    }
    return value;
  },
  setItem: asyncStorage.setItem,
  removeItem: asyncStorage.removeItem,
});

