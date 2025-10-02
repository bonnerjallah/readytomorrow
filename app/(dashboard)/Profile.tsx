import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search, SearchIcon, ChevronRight, LogOut  } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'
import { CirclePlus } from 'lucide-react-native'

//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import { router } from 'expo-router'

//🔥FIREBASE
import { auth } from '../../firebaseConfig'
import { signOut } from 'firebase/auth'


type Props = {}

const Profile = (props: Props) => {

  const {theme, darkMode, setDarkmode } = useTheme();

  const [completionSound, setCompletionSound] = useState(false);

  const toogleCompletionSound = () => {
    setCompletionSound(!completionSound);
  }

  const toggleDarkMode = () => {
    setDarkmode(darkMode === "dark" ? "light" : "dark");
  }


  //🔹 Darkmode


  //🔹 Sign out function
  const handleSignOut = async () => {
    try {
      await signOut(auth);  
      router.replace("/"); // Redirect to login screen after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }


  return (
    <ThemedView style={styles.container} safe>
      <Spacer height={20} />
      <ThemedText variant='heading' style={{textAlign:'center'}} title>Profile</ThemedText>

      <Spacer height={20} />

      <TouchableOpacity style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
        <ThemedText>Premium Subscription</ThemedText>
        <ChevronRight size={30} stroke={darkMode === "dark" ? theme.tabIconColor : "black"} />
      </TouchableOpacity>

      <TouchableOpacity style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}
        onPress={() => router.push("(notifications)/NotificationsSetting")}
      >
        <ThemedText>Notifications</ThemedText>
        <ChevronRight size={30} stroke={darkMode === "dark" ? theme.tabIconColor : "black"} />
      </TouchableOpacity>

      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
        <ThemedText>Completion Sound</ThemedText>
        <Switch
          value={completionSound}
          onValueChange={toogleCompletionSound}
        />
      </View>

      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
        <ThemedText>Dark Mode</ThemedText>
        <Switch 
          value={darkMode === "dark"} 
          onValueChange={toggleDarkMode}
        />

      </View>

      <TouchableOpacity
        style={[styles.button, { borderColor: theme.tabIconColor }]}
        onPress={() => {
          Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: handleSignOut }
          ], { cancelable: true });
        }}
      >
        <ThemedText>Log out</ThemedText>
        <LogOut size={20} stroke={darkMode === "dark" ? theme.tabIconColor : "black"} />
      </TouchableOpacity>
      
    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  
})