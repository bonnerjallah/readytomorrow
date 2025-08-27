// 🌱 ROOT IMPORTS
import { Tabs, router } from "expo-router";
import { useEffect } from "react";


// 🎨 UI
import { useTheme } from "components/ThemeContext";
import { Goal , House,  ClipboardList , TrendingUp, UserCog } from "lucide-react-native";


// 💾 FIREBASE
import { getAuth } from "firebase/auth";


export default () => {
    
    const {theme} = useTheme()

    useEffect(() => {
        const unsub = getAuth().onAuthStateChanged((firebaseUser) => {
            if(!firebaseUser) router.replace("/Login")
        })
        
        return unsub
    }, [])

    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    paddingTop: 10,
                    height: 100
                },
                tabBarActiveTintColor: theme.tabIconSelected,
                tabBarInactiveTintColor: theme.tabIconColor
            }}
        >

            <Tabs.Screen 
                name="Home"
                options={{
                    title: "Home",
                    tabBarLabel: "Home",
                    tabBarIcon: ({focused}) => (
                        <House
                            size = {30}
                            stroke={focused ? theme.tabIconSelected : theme.tabIconColor}
                            strokeWidth={focused ? 3 : 1.5} 
                        />
                    )

                }}
            />

            <Tabs.Screen
                name = "Activities"
                options={{
                    title: "Activities",
                    tabBarLabel: "Activities",
                    tabBarIcon:({focused}) => (
                        <ClipboardList 
                            size={30}
                            stroke={focused ? theme.tabIconSelected : theme.tabIconColor}
                            strokeWidth={focused ? 3 : 1.5}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name ="Goals"
                options={{
                    title: "Goals",
                    tabBarLabel: "Goals",
                    tabBarIcon: ({focused}) => (
                        <Goal  
                            size={30}
                            stroke={focused ? theme.tabIconSelected : theme.tabIconColor}
                            strokeWidth={focused ? 3 : 1.5}
                        />
                    )
                }}
            />

            <Tabs.Screen 
                name = "Progress"
                options={{
                    title: "Progress",
                    tabBarLabel: "Progress",
                    tabBarIcon: ({focused}) => (
                        <TrendingUp 
                            size={30}
                            stroke={focused ? theme.tabIconSelected : theme.tabIconColor}
                            strokeWidth={focused ? 3 : 1.5}
                        />
                    )
                }}
            />

            <Tabs.Screen 
                name = "Profile"
                options={{
                    title: "Profile",
                    tabBarLabel: "Profile",
                    tabBarIcon:({focused}) => (
                        <UserCog 
                            size={30}
                            stroke={focused ? theme.tabIconSelected : theme.tabIconColor}
                            strokeWidth={focused ? 3 : 1.5}
                        />
                    )
                }}
            />

            
        </Tabs>
    )

}
