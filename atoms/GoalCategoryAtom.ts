// atoms/goalAtom.ts
import { atom } from 'jotai';

export type Goal = {
  id: number;
  title: string;
  image: any; // or ImageSourcePropType
  backgroundColor: string;
};


export const GoalIdeaAtom = atom<string>("")
export const GoalCategoryAtom = atom<Goal | null>(null);
