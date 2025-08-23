import { useCallback, useState, useEffect } from 'react';
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
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges();
        return unsubscribe;
    }, []);

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