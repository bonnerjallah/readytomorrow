import { atom } from 'jotai';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

// existing types and atoms
type Goal = {
  id: number;
  title: string;
  image: any; // or ImageSourcePropType
  backgroundColor: string;
  goalName?: string
};

// New GoalType for Firestore goals
type GoalType = {
  id?: string;
  category: string;
  categoryImage?: string | null;
  goalName: string;
  note: string;
  selectedPriority?: 'Normal' | 'High' | 'Highest' | '';
  targetDate: Timestamp;
  startdate: Timestamp;
  longTerm: boolean;
  createdAt?: Timestamp |  null; 
  startdateFormatted?: string;               
  targetDateFormatted?: string;  
};

export const GoalIdeaAtom = atom<string>("");
export const GoalCategoryAtom = atom<Goal | null>(null);

// ✅ Atom to hold all goals
export const GoalsAtom = atom<GoalType[]>([]);

export const SelectedGoalAtom = atom<GoalType[]>([])
