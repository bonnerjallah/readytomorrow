// listen to Firebase auth changes and update jotai atom
// This is optional, but useful if you want global auth state
// without prop drilling or context
// Call subscribeToAuthChanges() once in your app entry point
// (e.g. _layout.tsx or App.tsx)
// This is separate from the useEffect in app/Index.tsx
// which handles redirects based on auth state

import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { AppUser, userAtom } from "./atoms/userAtoms";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

// Convert Firebase.User → AppUser
const mapUser = (user: User | null): AppUser | null => {
  if (!user) return null;
  return {
    id: user.uid,
    name: user.displayName || "",   // Or split to first/last
    email: user.email,
  };
};

// Call this once in your app entry (e.g. _layout.tsx or App.tsx)
export const subscribeToAuthChanges = () => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    const appUser = mapUser(firebaseUser);
    store.set(userAtom, appUser); // Updates jotai atom & AsyncStorage
  });
};
