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
import ActivitiesProgressModal from "components/ActivitiesProgressModal"


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
  routine: string
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
  const [sortedActivities, setSortedActivities] = useState<ActivityType[]>([]);
  const [sortedRoutines, setSortedRoutines] = useState<ActivityType[]>([]);
  const [showActivitiesProgressModal, setShowActivitiesProgressModal] = useState(false)
    

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

    let baseData = showRoutines ? [...allRoutines] : [...allActivities]

    if (value === "A-Z") {
      baseData.sort((a, b) => {
        const aText = (showRoutines ? a.routine : a.activity ?? "").replace(/^[^\p{L}\p{N}]+/u, "");
        const bText = (showRoutines ? b.routine : b.activity ?? "").replace(/^[^\p{L}\p{N}]+/u, "");
        return aText.localeCompare(bText);
      });
    }

    if (value === "Time") {
      baseData.sort((a, b) => {
      const atime = a.selectedTime ? new Date(a.selectedTime).getTime() : Infinity;
      const btime = b.selectedTime ? new Date(b.selectedTime).getTime() : Infinity;
      return atime - btime;
      });
    }

    if (value === "Date") {
      baseData.sort((a, b) => {
        const aDate = a.selectedDate ? new Date(a.selectedDate) : null;
        const bDate = b.selectedDate ? new Date(b.selectedDate) : null;

        const aDay = aDate ? new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate()).getTime() : Infinity;
        const bDay = bDate ? new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime() : Infinity;

        return aDay - bDay;
      });
    }
    if (showRoutines) {
      setSortedRoutines(baseData);
    } else {
      setSortedActivities(baseData);
    }
  };


  const selectGroupBy = (value: "Days" | "Priority" | "No Grouping") => {
    let baseGroup = showRoutines ? [...allRoutines] : [...allActivities];

    if (value === "No Grouping") {
      if (showRoutines) {
        setSortedRoutines(baseGroup);
      } else {
        setSortedActivities(baseGroup);
      }
      return;
    }

    type GroupedActivity = ActivityType & { groupKey: string };
    let grouped: GroupedActivity[] = [];

    if (value === "Days") {
      grouped = baseGroup.map((elem) => {
        const day = elem.selectedDate
          ? new Date(elem.selectedDate).toDateString()
          : "No Data";
        return { ...elem, groupKey: day };
      });
    }

    if (value === "Priority") {
      const priorityOrder = ["Highest", "High", "Normal"];
      baseGroup.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.selectedPriority ?? "Unknown");
        const bIndex = priorityOrder.indexOf(b.selectedPriority ?? "Unknown");
        return aIndex - bIndex;
      });

      grouped = baseGroup.map((elem) => ({
        ...elem,
        groupKey: elem.selectedPriority ?? "Unknown",
      }));
    }

    if (showRoutines) {
      setSortedRoutines(grouped);
    } else {
      setSortedActivities(grouped);
    }
  };

  //🔹Search function
  const handleSearch = (query: string) => {
    if(showRoutines) {
      const filtered = allRoutines.filter(elem => (
        (elem.routine).toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ))
      setSortedRoutines(filtered)
    } else {
      const filtered = allActivities.filter(elem => (
        (elem.activity).toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ))
      setSortedActivities(filtered)
    }
    setSearchData(query)
  };





  




  return (
    <ThemedView style={styles.container} safe>
      <View style={{flexDirection:"row", justifyContent:"space-between", marginTop: 10}}>
        <TouchableOpacity onPress={() => setShowActivitiesProgressModal(true)}>
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
          style={{width:'45%', backgroundColor: !showRoutines ? theme.primary : "#e9ecef"}}
        >
          <ThemedText>To-Dos</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={() => setShowRoutines(true)}
          style={{width:'45%', backgroundColor: showRoutines ? theme.primary: "#e9ecef"}}
        >
          <ThemedText>Routines</ThemedText>
        </ThemedButton>
      </View>

      <Spacer height={20} />

      <View>
        <ThemedTextInput
          placeholder='Search'
          value={searchData} 
          onChangeText={handleSearch} 
          keyboardType="default"
          returnKeyType='search'
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
              {(sortedRoutines.length > 0 ? sortedRoutines : allRoutines).map((elem, idx) => (
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
              {(sortedActivities.length > 0 ? sortedActivities : allActivities).map((elem, idx) => (
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
      <ActivitiesProgressModal isVisible={showActivitiesProgressModal} onClose={() => setShowActivitiesProgressModal(false)}/>        


    </ThemedView>
  )
}

export default Activities

const styles = StyleSheet.create({
  container:{
    flex: 1
  }
})