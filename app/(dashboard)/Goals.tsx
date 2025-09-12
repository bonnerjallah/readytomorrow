//🌱 ROOT IMPORTS
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'


// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search, SearchIcon } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'
import { CirclePlus } from 'lucide-react-native'


//🧩 COMPONENTS
import GoalsLayout from "../../components/GoalsLayout"


type Props = {}

const Goals = (props: Props) => {

  const {theme, darkMode} = useTheme()

  const [showWeekLyObjectivies, setShowWeekLyObjectivies] = useState(false)








  return (
    <ThemedView style={styles.container} safe>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity >
          <ChartNoAxesColumn size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>

        <ThemedText variant="heading">My Goals</ThemedText>

        <TouchableOpacity >
          <SlidersHorizontal size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>
      </View>

      <Spacer height={30} />

      <View style={{flexDirection:"row", justifyContent:"space-between", columnGap:5}}>
          
        <ThemedButton style={{width: "50%", height: 40, backgroundColor: !showWeekLyObjectivies ? theme.primary : '#adb5bd'}} onPress={() => setShowWeekLyObjectivies(prev => !prev)}>
          <ThemedText variant='smallertitle'>Long-Term </ThemedText>
        </ThemedButton>

        <ThemedButton style={{width: "50%", height: 40, backgroundColor: showWeekLyObjectivies ? theme.primary : '#adb5bd'}} onPress={() => setShowWeekLyObjectivies(prev => !prev)}>
          <ThemedText variant='smallertitle'>Weekly Objectives</ThemedText>
        </ThemedButton>
        
      </View>

      <Spacer  height={20}/>

      <ThemedTextInput 
        style={{backgroundColor:theme.background, alignItems:"center"}}
        placeholder='Search'
      >
        <Search  stroke={theme.tabIconColor}/>
      </ThemedTextInput>

      <Spacer height={20} />

      <ScrollView>
        <GoalsLayout />
      </ScrollView>

      <Pressable
        onPress={() => router.push("/(goalscreen)/AddGoals")}
        style={({ pressed }) => [
          {
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: "#34a0a4",
            borderRadius: 50, // make it perfectly round
            width: 60,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 4,
            elevation: 5,
            opacity: pressed ? 0.6 : 1,
            zIndex: 2,
          },
        ]}
      >
  <CirclePlus size={28} color="white" strokeWidth={2} />
</Pressable>

    </ThemedView>
  )
}

export default Goals

const styles = StyleSheet.create({
  container:{
    flex: 1
  }
})