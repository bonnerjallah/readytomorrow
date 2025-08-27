import { useState, useEffect } from 'react';
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Stack } from "expo-router";


// Firebase auth listener 
// This will update the userAtom with the current auth state
// and automatically sync with AsyncStorage
// This should be called once in your app entry point
// (e.g. _layout.tsx or App.tsx)
// It will not handle redirects, that's done in app/Index.tsx
import { subscribeToAuthChanges } from "../firebaseAuthListener"; 

//UI
import { useFonts } from 'expo-font'
import { useTheme, ThemeProvider } from "../components/ThemeContext"

//State Management
import { Provider } from "jotai";

//Splash Screen
import SplashScreenWithLottie from '../components/SplashScreenWithLottie';

// Root layout component
// Handles font loading, theme, and splash screen`
// Also sets up the navigation stack
// Wraps children with ThemeProvider and Jotai Provider
// This is the main layout for the app
// It includes the StatusBar and Stack navigator
// It also listens to Firebase auth changes
// and manages font loading and splash screen display
// It ensures a smooth user experience on app launch
// by showing a splash screen until everything is ready
// and applying the selected theme throughout the app
// It also hides headers for certain screens
// and customizes the StatusBar based on the theme
// This is a functional component using React hooks
// and is the entry point for the app's UI
// It is exported as the default export of this module
// and used in the app's navigation structure
// It is a key part of the app's architecture
// and should be maintained carefully
// to ensure a consistent and polished user experience
// across different devices and platforms
// It is recommended to keep this file clean and organized
// and to document any changes made to it
// for future reference and maintenance
// It is also important to test this component thoroughly
// to ensure it works as expected in all scenarios
// and to handle any edge cases that may arise
// Overall, this component plays a crucial role
// in the app's functionality and user experience
// and should be treated with care and attention
// to ensure the best possible outcome for users
// and developers alike
// Happy coding!
function Layout () {

  const [fontsLoaded] = useFonts({
    "Quicksand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
  });

  const {theme, darkMode} = useTheme();
  const [animationDone, setAnimationDone] = useState(false);

  // ✅ Always call hooks first
  // Subscribe to Firebase auth changes once
  // This will keep the user state in sync with Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges();
    return unsubscribe;
  }, []);

  // Callback when Lottie animation is done
  // This will update the state to indicate animation is complete
  const handleAnimationEnd = () => {
    setAnimationDone(true);
  };

  // Show Lottie splash until fonts AND animation are ready
  if (!fontsLoaded || !animationDone) {
    return <SplashScreenWithLottie onAnimationEnd={handleAnimationEnd} />;
  }

   

  return(
    <View style={{flex: 1}}>
      <StatusBar style={darkMode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {backgroundColor: theme.background},
          headerTintColor: theme.title,
          contentStyle: {backgroundColor: theme.background},
        }}
    >
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen name="(onboarding)" options={{headerShown: false}} />
        <Stack.Screen name="(auth)" options={{headerShown: false}} />
        <Stack.Screen name="(dashboard)" options={{headerShown: false}} />
        
      </Stack>
    </View>
  )

}

export default function RootLayout() {
  return (
    <Provider>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </Provider>
  );
}