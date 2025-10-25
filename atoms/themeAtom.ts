import { atomWithStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adapter for theme
const asyncThemeStorage = {
  getItem: async (key: string): Promise<'light' | 'dark' | null> => {
    const value = await AsyncStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : null;
  },
  setItem: async (key: string, value: 'light' | 'dark' | null) => {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

export const themeAtom = atomWithStorage<'light' | 'dark' | null>(
  'app:theme',
  null,
  asyncThemeStorage
);
