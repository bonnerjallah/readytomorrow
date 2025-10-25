import { atom } from "jotai";

type weeklyObjectiveActivitiesType = {
    id: string;
    activityName: string;
    createdAt: Date;
}

export const weeklyObjectiveActivitiesAtom = atom<weeklyObjectiveActivitiesType[]>([]);
export const selectedObjectiveIdAtom = atom<weeklyObjectiveActivitiesType | null>(null);