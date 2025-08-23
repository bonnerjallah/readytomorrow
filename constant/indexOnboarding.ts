import appointmentbooking from "../assets/animations/appointmentbooking.json";
import balancing from "../assets/animations/balancing.json";
import women from "../assets/animations/women.json";

export interface Onboarding {
  id: number;
  title: string;
  description: string;
  animation: any; // or LottieAnimationSource if you want stricter typing
}

export const onboarding: Onboarding[] = [
  {
    id: 1,
    title: "Welcome to ReadyTomorrow",
    description: "Organize your tasks, set goals, and get more done every day!",
    animation: appointmentbooking,
  },
  {
    id: 2,
    title: "Balance Your Goals",
    description: "Stay on top of your daily goals and see your achievements grow.",
    animation: balancing,
  },
  {
    id: 3,
    title: "Achieve More",
    description: "Tools and insights to help you thrive.",
    animation: women,
  },
];
