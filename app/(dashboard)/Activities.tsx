// 🌱 ROOT IMPORTS
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import React from 'react'



// ⚛️ STATEMENT MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import {taskAtom} from "../../atoms/selectedTaskAtom"
import { useSetAtom } from 'jotai';



// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

// 🧩 COMPONENTS
import DisplayOptionsModal from "../../components/DisplayOptionsModal"
import TaskCard from 'components/Taskcard'
import RescheduleModal from "../../components/RescheduleModal"
import EditDeleteModal from 'components/EditDeleteModal'


// 💾 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, doc, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore'


// 🔤 TYPES
type ActivityType = {
  id: string;
  activity: string;
  note?: string;
  selectedDate?: string;
  selectedTime?: string;
  isRecurring?: boolean;
  isAllDay?: boolean;
  reminder?: boolean;
  selectedPart?: "morning" | "afternoon" | "evening" | "";
  selectedPriority?: "Normal" | "High" | "Highest" | "";
  durationDays?: number;
  durationHours?: number;
  durationMinutes?: number;
  createdAt: any;
  done: boolean;
};



const Activities = () => {

  const {theme, darkMode} = useTheme()

  const setSelectedTask = useSetAtom(taskAtom)


  const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
  const [showRoutines, setShowRoutines] = React.useState(false)
  const [searchData, setSearchData] = useState("")
  const [allActivities, setAllActivities] = useState<ActivityType[]>([])
  const [allRoutines, setAllRoutines] = useState<ActivityType[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRedoModal, setShowRedoModal] = useState(false)
  const [sortedData, setSortatedData] = useState<ActivityType[] | null>(null)
  

  //🔹Component slide in animation
  const routinesAnim = useRef(new Animated.Value(showRoutines ? 1 : 0)).current;
  const activitiesAnim = useRef(new Animated.Value(showRoutines ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(routinesAnim, { toValue: showRoutines ? 1 : 0, duration: 300, useNativeDriver: true }).start();
    Animated.timing(activitiesAnim, { toValue: showRoutines ? 0 : 1, duration: 300, useNativeDriver: true }).start();
  }, [showRoutines]);


  //🔹Fetch all activities
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if(!userId) return

    const activitiesCol = collection(db, "users", userId, "activities")
    const q = query(activitiesCol, orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activitiesData: ActivityType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }  as ActivityType)).filter(elem => elem.done === false)

        setAllActivities(activitiesData)
      },
      (error) => {
        console.log("Error fetching user activities", error)
      }

    )

    return () => unsubscribe()

  }, [])

  // 🔹Fetch all routines
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if(!userId) return

    const routineCol = collection(db, "users", userId, "routines")
    const q = query(routineCol, orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const routineData: ActivityType[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityType[]

        setAllRoutines(routineData)
      }
    )
    return () => unsubscribe()
  }, [])
  
  // 🔹 Update user task complete
  const handleTaskComplete = async (id:string, newValue:boolean) => {

      const userId = auth.currentUser?.uid
      
      if(!userId) return


      try {
          const docRef = doc(db, "users", userId, "activities", id)
          await updateDoc(docRef, {done: newValue})
          
      } catch (error) {
          console.log("Error updating user task", error)
      }
  }

  // 🔹Sorting functions
  const selectSortBy = (value: "A-Z" | "Time" | "Date") => {

      let sorted = [...allActivities, ...allRoutines];

      if (value === "A-Z") {
          sorted.sort((a, b) => a.activity.localeCompare(b.activity));
      }

      if (value === "Time") {
          sorted.sort((a, b) => {
          const atime = a.selectedTime ? new Date(a.selectedTime).getTime() : Infinity;
          const btime = b.selectedTime ? new Date(b.selectedTime).getTime() : Infinity;
          return atime - btime;
          });
      }

      if (value === "Date") {
          sorted.sort((a, b) => {
              const aDate = a.selectedDate ? new Date(a.selectedDate) : null;
              const bDate = b.selectedDate ? new Date(b.selectedDate) : null;

              const aDay = aDate ? new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate()).getTime() : Infinity;
              const bDay = bDate ? new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime() : Infinity;

              return aDay - bDay;
          });
      }

      setSortatedData(sorted)
  };


  const selectGroupBy = (value: "Days" | "Priority" | "No Grouping") => {

      if (value === "No Grouping") {
          setSortatedData(allActivities); 
          return;
      }

      let group = [...allActivities, ...allRoutines]

      type GroupedActivity = ActivityType & { groupKey: string };

      if (value === "Days") {
          const grouped: GroupedActivity[] = [];

          group.forEach((elem) => {
              const day = elem.selectedDate
              ? new Date(elem.selectedDate).toDateString()
              : "No Data";

              grouped.push({ ...elem, groupKey: day });
          });

          setSortatedData(grouped); // still an array ✅
      }

      if (value === "Priority") {

          const priorityOrder = ["Highest", "High", "Normal"]

          const grouped: (ActivityType & { groupKey: string })[] = [];

          // sort first based on priorityOrder
          group.sort((a, b) => {
              const aIndex = priorityOrder.indexOf(a.selectedPriority ?? "Unknown");
              const bIndex = priorityOrder.indexOf(b.selectedPriority ?? "Unknown");
              return aIndex - bIndex;
          });

            // add groupKey for each activity
          group.forEach((elem) => {
              const priority = elem.selectedPriority ?? "Unknown";
              grouped.push({ ...elem, groupKey: priority });
          });

          setSortatedData(grouped);
      }

  }


  




  return (
    <ThemedView style={styles.container} safe>
      <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 10}}>
        <TouchableOpacity>
          {darkMode === "dark" ? (
            <ChartNoAxesColumn size={35} stroke="#34a0a4" />
          ) : (
            <ChartNoAxesColumn size={35} stroke="black"/>
          )}
        </TouchableOpacity>
        
        <ThemedText variant='heading'>Activities</ThemedText>

        <TouchableOpacity
          onPress={() => setShowDisplayOptionModal(true)}
        >
          {darkMode === "dark" ? (
            <SlidersHorizontal size={35} stroke="#34a0a4" />
          ) : (
            <SlidersHorizontal  size={35} stroke="black" />
          )}
        </TouchableOpacity>
      </View>
      
      <Spacer height={20} />

      <View style={{flexDirection:"row", justifyContent:"space-between"}}>
        <ThemedButton
          onPress={() => setShowRoutines(false)}
          style={{width:'45%', backgroundColor: !showRoutines ? theme.primary : theme.button}}
        >
          <ThemedText>To-Dos</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={() => setShowRoutines(true)}
          style={{width:'45%', backgroundColor: showRoutines ? theme.primary: theme.button}}
        >
          <ThemedText>Routines</ThemedText>
        </ThemedButton>
      </View>

      <Spacer height={20} />

      <View>
        <ThemedTextInput
          placeholder='Search'
          value={searchData} 
          onChangeText={setSearchData} 
        >
          <Search  style={{marginTop: 9}} />
        </ThemedTextInput>
      </View>

      <Spacer height={20} />
      <ScrollView
        showsVerticalScrollIndicator = {false}
        style={{padding: 10}}
      >

        <View style={{ flex: 1 }}>
          {/* Routines */}
          <Animated.View
            pointerEvents={showRoutines ? 'auto' : 'none'}
            style={{
              opacity: routinesAnim,
              transform: [
                {
                  translateX: routinesAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0], 
                  }),
                },
              ],
              position: 'absolute', // overlay
              width: '100%',
            }}
          >
            <View>
              {(sortedData ?? allRoutines).map((elem, idx) => (
                <TaskCard 
                  key={elem.id ?? idx}
                  elem={elem}
                  darkMode={darkMode ?? 'light'}
                  theme={theme}
                  setSelectedTask={setSelectedTask}
                  setShowEditModal={setShowEditModal}
                  handleTaskComplete={handleTaskComplete}
                  setShowRedoModal={setShowRedoModal}
                />
              ))}
            </View>
          </Animated.View>

          {/* Activities */}
          <Animated.View
            pointerEvents={showRoutines ? 'none' : 'auto'}          
            style={{
              opacity: activitiesAnim,
              transform: [
                {
                  translateX: activitiesAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 0], // slide out
                  }),
                },
              ],
              width: '100%',
            }}
          >
            <View>
              {(sortedData ?? allActivities).map((elem, idx) => (
                <TaskCard
                  key={elem.id ?? idx}
                  elem={elem}
                  darkMode={darkMode ?? 'light'}
                  theme={theme}
                  setSelectedTask={setSelectedTask}
                  setShowEditModal={setShowEditModal}
                  handleTaskComplete={handleTaskComplete}
                  setShowRedoModal={setShowRedoModal}
                />
              ))}
            </View>
          </Animated.View>
        </View>

      </ScrollView>



      <DisplayOptionsModal 
        isVisible={showDisplayOptionModal} 
        onClose={() => setShowDisplayOptionModal(false)} 
        selectSortBy={selectSortBy} 
        selectGroupBy={selectGroupBy} 
      />
      <RescheduleModal isVisible={showRedoModal} onClose={() => setShowRedoModal(false)} />
      <EditDeleteModal isVisible={showEditModal} onClose={() => setShowEditModal(false)} />


    </ThemedView>
  )
}

export default Activities

const styles = StyleSheet.create({
  container:{
    flex: 1
  }
})