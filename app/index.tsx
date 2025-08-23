import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// State management
import { useSetAtom } from 'jotai';
import { userAtom, AppUser } from '../atoms/userAtoms';

// Optional: import your Lottie splash screen
import SplashScreenWithLottie from '../components/SplashScreenWithLottie';


const Index = () => {
  
  const [loading, setLoading] = useState(true);
  const [seenOnboarding, setSeenOnboarding] = useState(false);

  const setUser = useSetAtom(userAtom);


  // For testing purposes: clear onboarding flag on each app start
  // Remove this in production
  useEffect(() => {
    const resetOnboarding = async () => {
      try {
        await AsyncStorage.removeItem('seenOnboarding');
        console.log('Onboarding flag cleared!');
      } catch (error) {
        console.error('Error clearing onboarding flag:', error);
      }
    };

    resetOnboarding();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      // Check if onboarding was seen
      const seen = await AsyncStorage.getItem('seenOnboarding');
      setSeenOnboarding(seen === 'true');

      // Listen for Firebase auth state
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || null,
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      });
    };

    checkAuth();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [setUser]);

  // While loading, show a Lottie splash
  if (loading) return <SplashScreenWithLottie onAnimationEnd={() => {}} />;

  // Redirects
  if (!seenOnboarding) return <Redirect href="(onboarding)/Welcome" />;
  if (!auth.currentUser) return <Redirect href="(auth)/Login" />;

  return <Redirect href="/Home" />;
};

export default Index;
