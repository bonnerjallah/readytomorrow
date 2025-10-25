import { atomWithStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Storage = {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const asyncStorage: Storage = {
  getItem: async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: async (key) => {
    await AsyncStorage.removeItem(key);
  },
};

export const notificationAtom = atomWithStorage<boolean>('app:notification', true, asyncStorage);
export const completionSoundAtom = atomWithStorage<boolean>('app:completionSound', true, asyncStorage);
export const dailyRemindersAtom = atomWithStorage<boolean>('app:dailyReminders', true, asyncStorage);
export const remindersAtom = atomWithStorage<boolean>('app:reminders', true, asyncStorage);
export const alertTimesAtom = atomWithStorage<Record<string, string>>('app:alertTimes', {
  "Default Alert Time": "08:00 AM",
  "Morning Routine Reminder": "7:00 AM",
  "Evening Routine Reminder": "7:00 PM",
}, asyncStorage);