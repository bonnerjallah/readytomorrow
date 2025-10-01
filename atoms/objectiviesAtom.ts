import {atom} from "jotai";
import { Timestamp } from "firebase/firestore";

type ObjectiveDataType = {
  id: string;
  objectiveName: string;  
  objectiveNote: string;
  targetDate: string;
  completed: boolean;
  goalId: string;
  createdAt: Timestamp | null;
}

export const objectivesAtom = atom<ObjectiveDataType[]>([]);