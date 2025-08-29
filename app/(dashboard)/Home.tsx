// 🌱 ROOT IMPORTS
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useEffect, useState } from 'react'
import Checkbox from "expo-checkbox";

// 🎨 UI
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { CalendarDays, CirclePlus, SlidersHorizontal, TableOfContents } from 'lucide-react-native'

// 🧩 COMPONENTS
import AddTaskModal from "../../components/AddTaskModal"
import DisplayOptionsModal from "../../components/DisplayOptionsModal"
import HambergurMenuModal from "../../components/HambergurMenuModal"
import ActivityInputModal from "../../components/ActivityInputModal"
import ShowDailyRitualModal from "../../components/ShowDailyRitualModal"


// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import ScheduleRoutineModal from '../../components/ScheduleRoutineModal'

// 💾 FIREBASE
import {auth, db} from "../../firebaseConfig"
import { collection, getDocs, doc, query, orderBy, updateDoc} from 'firebase/firestore'



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

const Home = () => {

    const {darkMode} = useTheme()

    const [showAddTaskModal, setShowAddTaskModal] = useState(false)
    const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
    const [showHamburgerModal, setShowHamburgerModal] = useState(false)
    const [showActivityInputModal, setShowActivityInputModal] = useState(false);
    const [showScheduleRoutine, setShowScheduleRoutineModal] = useState(false)
    const [showDailyRitualModal, setShowDailyRitualModal] = useState(false)

    // 🔹fetch data state
    const [allActivities, setAllActivities] = useState<ActivityType[]>([]);
    const [dayActivities, setDayActivities] = useState<ActivityType[]>([])



    // 🔹Fetch user activities
    useEffect(() => {
        const fetchData = async () => {
            const userId = auth.currentUser?.uid;
            if(!userId) return;

            try {
                // Reference the subcollection
                const activitiesCol = collection(db, "users", userId, "activities")
                const q = query(activitiesCol, orderBy("createdAt", "asc")) //"decs" old data first "asc" new first
                const snapshot = await getDocs(q)

                const activitiesData : ActivityType[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ActivityType[]

                // ✅ Format today into "yyyy-MM-dd"
                const today = new Date().toISOString().split("T")[0]; 

                const todayActivities = activitiesData.filter(elem => elem.selectedDate === today)

                setAllActivities(activitiesData)
                setDayActivities(todayActivities);
            } catch (error) {
                console.log("Error fetching user activities", error)
            }
        }
        fetchData()
    }, [dayActivities])


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

    const selectSortBy = (value: "A-Z" | "Time" | "Date") => {
        console.log("Selected sort:", value);
        
    };

    const selectGroupBy = (value: "Days" | "Goals" | "Priority" | "No Grouping") => {
        console.log("Selected group", value)
    }
    

    const selectIncludes = (value: "Recently Missed Activities" | "Skipped Activities") => {
        console.log("selectd includes", value)
    }


  return (
    <ThemedView style={styles.container} safe>

        <Spacer height={10} />

        <View style={{flexDirection: "row", justifyContent:"space-between", paddingHorizontal: 5}}>
            <TouchableOpacity
                onPress={() => setShowHamburgerModal(true)}
            >
                {darkMode === "dark" ? (
                    <TableOfContents size={35} stroke="#34a0a4" />
                ) : (
                    <TableOfContents  size={35} stroke="black" />
                )}
            </TouchableOpacity>

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
        
        <Spacer height={5} />

        <View style={{borderBottomWidth: .5, borderBottomColor: "gray", paddingBottom: 15}}>

            <View style={{ flexDirection:"row", justifyContent:"space-between"}}>
                <ThemedText variant='heading' title>Today</ThemedText>
            </View>

            <View style={{flexDirection:"row", alignItems:"center", columnGap: 5}}>
                {darkMode === "dark" ? (
                    <CalendarDays size={20} stroke="#34a0a4" />
                ) : (
                    <CalendarDays  size={20} stroke="black" />
                )}
                <ThemedText title>
                    {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    })}
                    
                </ThemedText>
            </View>
        </View>

        <Spacer height={10} />

        <View style={{flex: 1}}>
            <ScrollView>
                <View style={{rowGap: 15}}>
                    {dayActivities && dayActivities.map((elem, idx) => (
                        <View
                            key={idx}
                            style={styles.taskCard}
                        >
                            <ThemedText>
                                {elem.isAllDay ? (
                                    <ThemedText variant='smallertitle'>All Day</ThemedText>
                                ) : elem.selectedPart ? (
                                    <ThemedText variant='smallertitle'>{elem.selectedPart}</ThemedText>
                                ) : (
                                    <View>
                                        <ThemedText variant='smallertitle'>Any Time</ThemedText>
                                    </View>
                                )}
                            </ThemedText>
                            <View style={{flexDirection:"row", height: 30, columnGap: 10, alignItems:"center", marginTop: 10}} >

                                <TouchableOpacity
                                    style={{
                                        height: 20, 
                                        borderRadius: 10,
                                        borderWidth: 0.5, 
                                        width: 20, 
                                        backgroundColor: elem.done ? "green" : "transparent"
                                    }}
                                    onPress={() => handleTaskComplete(elem.id, !elem.done)}
                                >
                                </TouchableOpacity>

                                <ThemedText variant='body'>
                                    {elem.activity}
                                </ThemedText>

                            </View>

                        </View>
                    ))}
                    




                </View>
            </ScrollView>

            <Pressable
                onPress={() => setShowAddTaskModal(true)}
                style={({ pressed }) => [
                    {
                    position: "absolute",
                    bottom: 20,
                    right: 20,
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
        </View>

        <AddTaskModal 
            isVisible={showAddTaskModal} 
            onClose={() => setShowAddTaskModal(false)} 
            onSelect={(type) => {
                if(type === "activity") {
                    setShowAddTaskModal(false)
                    setShowActivityInputModal(true)
                } else if (type === "routine") {
                    setShowAddTaskModal(false)
                    setShowScheduleRoutineModal(true)
                } else {
                    setShowAddTaskModal(false)
                    setShowDailyRitualModal(true)
                }
                return
            }}
        />
        <DisplayOptionsModal 
            isVisible={showDisplayOptionModal} 
            onClose={() => setShowDisplayOptionModal(false)}  
            selectSortBy={selectSortBy} 
            selectGroupBy={selectGroupBy} 
            selectIncludes={selectIncludes}
        />
        <HambergurMenuModal isVisible={showHamburgerModal} onClose={() => setShowHamburgerModal(false)} />
        <ActivityInputModal isVisible={showActivityInputModal} onClose={() => setShowActivityInputModal(false)}/>
        <ShowDailyRitualModal isVisible={showDailyRitualModal} onClose={() => setShowDailyRitualModal(false)}/>
        <ScheduleRoutineModal isVisible={showScheduleRoutine} onClose={() => setShowScheduleRoutineModal(false)} />

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex: 1,
    }, 

    taskCard:{
        borderWidth: 1,
        height: 100,
        borderRadius: 10,
        padding: 10
    }
})