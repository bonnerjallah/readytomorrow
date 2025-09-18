import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator, Pressable, Animated, ScrollView, FlatList } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet'


// ⚛️ STATE MANAGEMENT
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom'
import { useTheme } from '../../components/ThemeContext'

//🎨UI
import ThemedText from 'components/ThemedText'
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import {ArrowBigLeft, CirclePlus, Trash2 } from 'lucide-react-native'


//🧩COMPONENTS
import AddMilestonesModal from '../../components/AddMilestonesModal'
import MileStoneInput from "../../components/MileStoneInput"
import WeeklyGoalObjectiveModal from "../../components/WeeklyGoalObjectiveModal"
import GoalsNoteInputModal from "../../components/GoalsNoteInputModal"

//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, onSnapshot, query, orderBy, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import Checkbox from 'expo-checkbox'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import ThemedView from 'components/ThemedView'

//🔤TYPES
type MilestoneDataType = {
  id: string;
  mileStoneName: string;
  mileStoneNote: string;
  targetDate: string;
  completed: boolean;
  createdAt: Timestamp | null;
}

type ObjectivesType = {
  id: string
  weekObjective: string,
  objectiveNote: string,
  lastDayOfTheWeek: string,
  completed: boolean,
  createdAt: Timestamp | null
}

type NoteType = {
  id: string
  goalNote: string
}


const MileStone = () => {
  const { theme, darkMode } = useTheme()

  const bottomSheetRef = useRef<BottomSheet>(null)

  const selectedGoal = useAtomValue(SelectedGoalAtom)

  const insets = useSafeAreaInsets()

  const [loadingImage, setLoadingImages] = useState<{[key: string] : boolean}>()
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showWeeklyObjectiveModal, setShowWeeklyObjectiveModal] = useState(false)
  const [showGoalNoteInputModal, setShowGoalNoteInputModal] = useState(false)
  const [showMilestoneInputModal, setShowMilestoneInputModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"milestones" | "weekly" | "notes">("milestones");
  const [allMilestoneData, setAllMilestoneData] = useState<MilestoneDataType[]>([])
  const [mileStoneCompleted, setMilestoneCompleted] = useState<MilestoneDataType[]>([])
  const [displayMilestone, setDisplayMilestone] = useState<MilestoneDataType[]>([])
  const [allweeklyObjective, setAllWeeklyObjective] = useState<ObjectivesType[]>([])
  const [allNotes, setAllNotes] = useState<NoteType[]>([])


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

  //🔹Fetch milestone
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId || !selectedGoal?.id) return;

    const milestoneCol = collection(db, "users", userId, "goals", selectedGoal.id, "milestones");
    const q = query(milestoneCol, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const milestoneData: MilestoneDataType[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MilestoneDataType))

      setAllMilestoneData(milestoneData);

      const completedMilesotne = milestoneData.filter(elem => !elem.completed)
      setMilestoneCompleted(completedMilesotne)

      const displayMilestone = milestoneData.filter(elem => !elem.completed)
      setDisplayMilestone(displayMilestone)
    });

    return () => unsubscribe();
  }, [selectedGoal]);

  //🔹Fetch Objectivies
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    const objectiviesCol = collection(db, "users", userId, "goals", selectedGoal.id, "goalObjectives")
    const q = query(objectiviesCol, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const goalObjectiviesData : ObjectivesType [] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ObjectivesType))

      setAllWeeklyObjective(goalObjectiviesData)
    })


    return () => unsubscribe()

  }, [selectedGoal])

  //🔹Fetch Goal Notes
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    const noteCol = collection(db, "users", userId, "goals", selectedGoal?.id, "goalNotes")
    const q = query(noteCol, orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, snapshot => {
      const noteData : NoteType[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }as NoteType))

      setAllNotes(noteData)
    })
    


  }, [selectedGoal])

  //🔹Update milestone complete
  const handleMilestoneComplete = async (milestone: MilestoneDataType) => {
    const newValue = !milestone.completed;

    // Update local UI immediately
    setAllMilestoneData(prev =>
      prev.map(elem =>
        elem.id === milestone.id ? { ...elem, completed: newValue } : elem
      )
    );

    const userId = auth.currentUser?.uid;
    if (!userId || !selectedGoal?.id) return;

    try {
      const docRef = doc(
        db,
        "users",
        userId,
        "goals",
        selectedGoal.id, 
        "milestones",
        milestone.id
      );

      await updateDoc(docRef, { completed: newValue });

    } catch (error) {
      console.log("Error updating milestone:", error);
    }
  };

  //🔹Milestone completed function
  useEffect(() => {
    const totalMilestoneDone = allMilestoneData.filter(elem => elem.completed)
    setMilestoneCompleted(totalMilestoneDone)
  }, [allMilestoneData])

  //🔹Delete Milestone
  const handleDeleteMilestone = async (milestone: MilestoneDataType) => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    try {
      const docRef = doc(db, "users", userId, "goals", selectedGoal?.id, "milestones", milestone.id )
      await deleteDoc(docRef)
    } catch (error) {
      console.log("Error deleting milestone", error)
    }    
  }

  //🔹Delete Objectivies
  const handleDeleteObjectivies = async(goalObjectivies: ObjectivesType) => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    try {

      const docRef = doc(db, "users", userId, "goals", selectedGoal?.id, "goalObjectives", goalObjectivies.id)
      await deleteDoc(docRef)
      
    } catch (error) {
      console.log("Error deleting objective", error)      
    }
  }

  //🔹Delete Note
  const handleDeleteNote = async(goalNote: NoteType) => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    try {
      const docRef = doc(db, "users", userId, "goals", selectedGoal?.id, "goalNotes", goalNote.id )
      await deleteDoc(docRef)
      
    } catch (error) {
      console.log("Error deleting note", error)
    }
  }






  return (
    <GestureHandlerRootView>
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
            <View style={{ flex: 1, position: "relative", minHeight: 500 }}>
              
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
                <View style={{ flex: 1, padding: 10 }}>
                  <View style={{ flexDirection: "row", columnGap: 5 }}>
                    <ThemedText variant='smallertitle'>
                      {mileStoneCompleted.length}/{allMilestoneData.length}
                    </ThemedText>
                    <ThemedText variant='smallertitle'>milestone</ThemedText>
                  </View>

                  {displayMilestone && displayMilestone.length > 0 ? (
                    displayMilestone.map((milestone, idx) => (
                      <View key={milestone.id ?? idx} style={{ padding: 10, borderWidth: 0.4, borderRadius: 10, marginVertical: 10, borderColor: theme.tabIconColor}}>
                        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                          <View style={{flexDirection:"row", alignItems:"center", columnGap: 10}}>
                            <Checkbox 
                              value={milestone.completed}           
                              onValueChange={() => handleMilestoneComplete(milestone)}
                              color={milestone.completed ? "#34a0a4" : undefined}
                              style={{ transform: [{ scale: 1.5 }], borderRadius: 10 }}
                            />
                            <View>
                              <ThemedText variant="subtitleBold">{milestone.mileStoneName}</ThemedText>
                              {milestone.mileStoneNote ? (
                                <ThemedText variant='smallertitle'>{milestone.mileStoneNote}</ThemedText>
                              ) : (
                                <></>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleDeleteMilestone(milestone)}
                          >
                            <Trash2 size={25}  stroke="red"/>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
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
                <View style={{ flex: 1, }}>
                  {allweeklyObjective && allweeklyObjective.length > 0 ? (
                    allweeklyObjective.map((elem, indx) => (
                      <View key={elem.id ?? indx} style={{ padding: 10, borderWidth: 0.4, borderRadius: 10, marginVertical: 10, borderColor: theme.tabIconColor}}>
                        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                          <View style={{flexDirection:"row", alignItems:"center", columnGap: 10}}>
                            <Checkbox 
                              value={elem.completed}           
                              onValueChange={() => handleDeleteObjectivies(elem)}
                              color={elem.completed ? "#34a0a4" : undefined}
                              style={{ transform: [{ scale: 1.5 }], borderRadius: 10 }}
                            />
                            <View>
                              <ThemedText variant="subtitleBold">{elem.weekObjective}</ThemedText>
                              {elem.objectiveNote ? (
                                <ThemedText variant='smallertitle'>{elem.objectiveNote}</ThemedText>
                              ) : (
                                <></>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleDeleteObjectivies(elem)}
                          >
                            <Trash2 size={25}  stroke="red"/>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ): (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                      <ThemedText variant='body'>Tap + to add a Milestone for this goal</ThemedText>
                    </View>
                  )}
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
                <View style={{ flex: 1 }}>
                  {allNotes && allNotes.length > 0 ? (
                    allNotes.map((elem, indx) => (
                      <View
                        key={elem.id ?? indx}
                        style={{
                          padding: 10,
                          borderWidth: 0.4,
                          borderRadius: 10,
                          marginVertical: 10,
                          borderColor: theme.tabIconColor,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 10 }}>
                            <View>
                              {elem.goalNote && <ThemedText variant="body">{elem.goalNote}</ThemedText>}
                            </View>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteNote(elem)}>
                            <Trash2 size={25} stroke="red" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                      <ThemedText variant="body">Tap + to add a Milestone for this goal</ThemedText>
                    </View>
                  )}
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
            } else if(type === "Add Weekly Objective") {
              setShowMilestoneModal(false)
              setShowWeeklyObjectiveModal(true)
            } else {
              setShowMilestoneModal(false)
              setShowGoalNoteInputModal(true)
            }
            return
          }}
        />
        <MileStoneInput isVisible={showMilestoneInputModal} onClose={() => setShowMilestoneInputModal(false)}/>
        <WeeklyGoalObjectiveModal isVisible={showWeeklyObjectiveModal} onClose={() => setShowWeeklyObjectiveModal(false)} />
        <GoalsNoteInputModal isVisible={showGoalNoteInputModal} onClose={() => setShowGoalNoteInputModal(false)} />
      </View>

        

    </GestureHandlerRootView>
  )
}

export default MileStone

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
