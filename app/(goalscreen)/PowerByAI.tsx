import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'

import SelectedGoalOption from "./SelectedGoalOption"
import ThemedView from 'components/ThemedView'
import ThemedText from 'components/ThemedText'

import { CircleX } from 'lucide-react-native';

import { useAtomValue } from 'jotai'
import { GoalIdeaAtom } from 'atoms/GoalCategoryAtom'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import ThemedButton from 'components/ThemedButton'
import LottieView from 'lottie-react-native';


import robotAI from "../../assets/animations/robotAI.json"

import { useTheme } from 'components/ThemeContext'

const { width, height } = Dimensions.get('window');


const PowerByAI = () => {

  const goalIdea = useAtomValue(GoalIdeaAtom)
  const {theme, darkMode} = useTheme()



  const [newGoalIdeas, setNewGoalIdea] = useState<string>("")

  console.log("goal idea", goalIdea)

  return (
    <SelectedGoalOption snapPoints={["91%"]} index={0}>
      <ThemedView style={{ flex: 1,  alignItems: "center", width:"100%", paddingHorizontal: 10}} safe>

      <LottieView
          source={robotAI}
          autoPlay
          loop
          style={{ width: width * 0.4, height: height * 0.1, marginBottom: 10}}
        />
       

        <TouchableOpacity 
          onPress={() => router.back()}
          style={{top:15, left: 15,  
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 40,
              width:"10%",
              position:'absolute'
          }}
      >
          <CircleX size={40} stroke="#77d1d2ff" />
      </TouchableOpacity>

        <View>
          <ThemedText variant='title' title>
            AI-Powered Goal Planning 
          </ThemedText>
        </View>

        <Spacer height={30} />

        <ThemedText style={{textAlign:"center"}}>
          Want ChatGPT to help you come up with creative steps to achieve your goals?
        </ThemedText>

        <Spacer height={25} />

        <View style={{width:"90%"}}>
          <ThemedText variant='subtitle'>Your Goal</ThemedText>
          <ThemedTextInput 
            placeholder={goalIdea}
            value={newGoalIdeas}
            onChangeText={setNewGoalIdea}
          />
        </View>

        <Spacer height={25} />

        <ThemedButton style={{width:"70%"}}>
          <ThemedText style={{color: theme.buttontitle}}>Yes, Ask ChatGPT</ThemedText>
        </ThemedButton>

        <Spacer height={25} />
        
        <ThemedButton 
          style={{
            backgroundColor: darkMode === "dark" ? "white" : theme.tabIconColor, 
            width:"70%"
          }}
          onPress={() => router.push("(goalscreen)/SetGoals")}
        >
          <ThemedText style={{color: theme.buttontitle}}>No, I'll create it myself</ThemedText>
        </ThemedButton >
      </ThemedView>
    </SelectedGoalOption>
        
    
  )
}

export default PowerByAI

const styles = StyleSheet.create({})