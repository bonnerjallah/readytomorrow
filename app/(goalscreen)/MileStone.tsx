import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator, Pressable, Animated, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'


// ⚛️ STATE MANAGEMENT
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom'
import { useTheme } from '../../components/ThemeContext'

//🎨UI
import ThemedText from 'components/ThemedText'
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import {ArrowBigLeft, CirclePlus } from 'lucide-react-native'


//🧩COMPONENTS
import AddMilestonesModal from '../../components/AddMilestonesModal'
import MileStoneInput from "../../components/MileStoneInput"
import ThemedView from 'components/ThemedView'




const MileStone = () => {
  const { theme, darkMode } = useTheme()

  const selectedGoal = useAtomValue(SelectedGoalAtom)

  const insets = useSafeAreaInsets()

  const [loadingImage, setLoadingImages] = useState<{[key: string] : boolean}>()
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showMilestoneInputModal, setShowMilestoneInputModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"milestones" | "weekly" | "notes">("milestones");
  const [allMilestoneData, setAllMilestoneData] = useState("")


  //🔹Animation
  const milestonesAnim = useRef(new Animated.Value(1)).current; // start visible
  const weeklyAnim = useRef(new Animated.Value(0)).current;
  const notesAnim = useRef(new Animated.Value(0)).current;

  //🔹Tab switch function
  const switchTab = (tab: "milestones" | "weekly" | "notes") => {
    setActiveTab(tab)
    const anims = {
      milestones: milestonesAnim,  
      weekly: weeklyAnim,
      notes: notesAnim
    }

    Object.keys(anims).forEach(elem => {
      Animated.timing(anims[elem as keyof typeof anims], {
        toValue: elem === tab ? 1 : 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    })
  }






  //🔹Image soruce
  const imageSource = (image: string | number | null | undefined) => {
    if (!image) return require("../../assets/images/manwriting.png")
    return typeof image === "number" ? image : { uri: image }
  }

  return (
    <View style={styles.container}>
      {/* Transparent status bar so image shows behind */}
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Background image extending into status bar */}
      <Image
        source={imageSource(selectedGoal?.categoryImage)}
        style={{
          width: "100%",
          height: 170 + insets.top, // cover notch/status bar
          resizeMode: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1
        }}

        onLoadStart={() => {
          const key = typeof selectedGoal?.categoryImage === "string" ? selectedGoal.categoryImage : "fallback";
          setLoadingImages(prev => ({ ...prev, [key]: false }));
        }}
        onLoadEnd={() => {
          const key = typeof selectedGoal?.categoryImage === "string" ? selectedGoal.categoryImage : "fallback"
          setLoadingImages(prev => ({...prev, [key]: false}))
        }}
      />

      {selectedGoal?.id && loadingImage?.[selectedGoal.id] && (
        <ActivityIndicator
          size="small"
          color={theme.primary}
          style={{
            position: "absolute",
            top: "40%",
            alignSelf: "center",
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",   // key fix
          top: insets.top + 10,   // safe area aware
          left: 10,
          zIndex: 10,
          backgroundColor: "white",
          borderRadius: 10 
        }}
      >
        <ArrowBigLeft size={40} stroke= "#77d1d2ff"  />
      </TouchableOpacity>

      <Spacer height={175} />

      {/* Foreground content */}
      <SafeAreaView style={{ flex: 1 , backgroundColor: theme.background, padding: 10}}>

        <View style={{}}>
          {selectedGoal && (
            <ThemedText variant='title'>{selectedGoal.goalName}</ThemedText>
          )}
        </View>

        <Spacer height={10} />

        <View>
          <ThemedText>status bar here</ThemedText>
        </View>

        <Spacer height={15} />

        <View style={{flexDirection:"row", justifyContent: "space-between"}}>
          <ThemedButton style={{width: "33%", height: 40, justifyContent:"center", alignItems:"center", backgroundColor: activeTab === "milestones" ? theme.primary : "#adb5bd"}}
            onPress={() => switchTab("milestones")}
          >
            <ThemedText style={{color: "buttontitle", fontSize: 13}}>Milestones</ThemedText>
          </ThemedButton>
          <ThemedButton style={{width: "33%", height: 40, justifyContent:"center", alignItems:"center", backgroundColor: activeTab === "weekly" ? theme.primary : "#adb5bd"}}
            onPress={() => switchTab("weekly")}
          >
            <ThemedText style={{color: "buttontitle", fontSize: 13}}>Weekly Objectivies</ThemedText>
          </ThemedButton>
          <ThemedButton style={{width: "33%", height: 40, justifyContent:"center", alignItems:"center", backgroundColor: activeTab === "notes" ? theme.primary : "#adb5bd"}}
            onPress={() => switchTab("notes")}
          >
            <ThemedText style={{color: "buttontitle", fontSize: 13}}>Notes</ThemedText>
          </ThemedButton>
        </View>

        <Spacer height={10} />

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, position: "relative", minHeight: 500 /* or screen height minus header */ }}>
            
            {/* Milestones Tab */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: milestonesAnim,
                transform: [
                  { translateX: milestonesAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 0] }) }
                ],
              }}
            >
              <View style={{ flex: 1, borderWidth: 1, borderColor: "red", padding: 10 }}>
                <View style={{ flexDirection: "row", columnGap: 5 }}>
                  <ThemedText variant='smallertitle'>0/0</ThemedText>
                  <ThemedText variant='smallertitle'>milestone</ThemedText>
                </View>

                {allMilestoneData && allMilestoneData.length > 0 ? (
                  <View />
                ) : (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ThemedText variant='body'>Tap + to add a Milestone for this goal</ThemedText>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Weekly Tab */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: weeklyAnim,
                transform: [
                  { translateX: weeklyAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 0] }) }
                ],
              }}
            >
              <View style={{ flex: 1, borderWidth: 1, borderColor: "blue" }}>
                {/* Weekly content */}
              </View>
            </Animated.View>

            {/* Notes Tab */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: notesAnim,
                transform: [
                  { translateX: notesAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }) }
                ],
              }}
            >
              <View style={{ flex: 1, borderWidth: 1, borderColor: "yellow" }}>
                {/* Notes content */}
              </View>
            </Animated.View>

          </View>
        </ScrollView>



          

        <Pressable
          onPress={() => setShowMilestoneModal(true)}
          style={({ pressed }) => [
              {
              position: "absolute",
              
              bottom: 90,
              right: 35,
              backgroundColor: "#34a0a4",
              borderRadius: 30,
              padding: 15,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 4,
              elevation: 5,
              opacity: pressed ? 0.5 : 1, 
              zIndex: 2
              },
          ]}
        >
          <CirclePlus size={30} color="white" strokeWidth={2} />
        </Pressable>
        

      </SafeAreaView>
      <AddMilestonesModal 
        isVisible={showMilestoneModal} 
        onClose={() => setShowMilestoneModal(false)} 
        onSelect={(type) => {
          if(type === "Add Milestone") {
            setShowMilestoneModal(false)
            setShowMilestoneInputModal(true)
          }
        }}
      />
      <MileStoneInput isVisible={showMilestoneInputModal} onClose={() => setShowMilestoneInputModal(false)} />
    </View>
  )
}

export default MileStone

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
