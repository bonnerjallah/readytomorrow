import { atom } from "jotai";

// selectedTaskAtom.ts
export type TaskType = {
  id: string;
  activity: string;
  note?: string;
  selectedDate?: string;
  selectedTime?: string;
  isRecurring?: boolean;
  isAllDay?: boolean;
  reminder?: boolean;
  selectedPart?: "morning" | "afternoon" | "evening" | "";
  selectedPriority?: "Normal" | "High" | "Highest" | "";
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
  createdAt: any;
  done: boolean;
};

export type RoutineType = {
  id: string;
  routine: string;
  note?: string;
  selectedDate?: string;
  selectedTime?: string;
  isRecurring?: boolean;
  isAllDay?: boolean;
  reminder?: boolean;
  selectedPart?: "morning" | "afternoon" | "evening" | "";
  selectedPriority?: "Normal" | "High" | "Highest" | "";
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
  createdAt: any;
  done: boolean;
  recurringOption?: string;
  selectedDays?: string[];
  timesPerWeek?: number;
  dayOfTheWeek?: string[];
};


export const routineAtom = atom<RoutineType | null>(null);
export const taskAtom = atom<TaskType | null>(null);
export const selectedItemTypeAtom = atom<'task' | 'routine' | null>(null);

