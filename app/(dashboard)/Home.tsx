// 🌱 ROOT IMPORTS
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useEffect, useState, useMemo } from 'react'
import Checkbox from "expo-checkbox";

// 🎨 UI
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { CalendarDays, ChevronDown, CirclePlus, ClipboardCheck, ClipboardX, Clock, EllipsisVertical, RedoDot, SlidersHorizontal, SquareCheck, TableOfContents } from 'lucide-react-native'

// 🧩 COMPONENTS
import AddTaskModal from "../../components/AddTaskModal"
import DisplayOptionsModal from "../../components/DisplayOptionsModal"
import HambergurMenuModal from "../../components/HambergurMenuModal"
import ActivityInputModal from "../../components/ActivityInputModal"
import ShowDailyRitualModal from "../../components/ShowDailyRitualModal"
import EditDeleteModal from "../../components/EditDeleteModal"


// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import ScheduleRoutineModal from '../../components/ScheduleRoutineModal'
import { useSetAtom } from 'jotai';
import {taskAtom} from "../../atoms/selectedTaskAtom"


// 💾 FIREBASE
import {auth, db} from "../../firebaseConfig"
import { collection, getDocs, doc, query, orderBy, updateDoc, onSnapshot, deleteDoc} from 'firebase/firestore'


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

    const {theme, darkMode} = useTheme()

    const setSelectedTask = useSetAtom(taskAtom)

    const [showAddTaskModal, setShowAddTaskModal] = useState(false)
    const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
    const [showHamburgerModal, setShowHamburgerModal] = useState(false)
    const [showActivityInputModal, setShowActivityInputModal] = useState(false);
    const [showScheduleRoutine, setShowScheduleRoutineModal] = useState(false)
    const [showDailyRitualModal, setShowDailyRitualModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    // 🔹fetch data state
    const [allActivities, setAllActivities] = useState<ActivityType[]>([]);


    // 🔹Fetch user activities
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const activitiesCol = collection(db, "users", userId, "activities");
        const q = query(activitiesCol, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const activitiesData: ActivityType[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ActivityType[];


                setAllActivities(activitiesData);
            },
            (error) => {
                console.log("Error fetching real-time activities:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    //🔹 Helper: format date as YYYY-MM-DD local
    const formatLocalDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const todayStr = formatLocalDate(new Date());


    // 🔹Today activities
   const todayActivities = useMemo(() => {
        return allActivities.filter(task => {
            if (task.done) return false;
            if (!task.selectedDate) return false;

            return task.selectedDate === todayStr;
        });
    }, [allActivities]);



    // 🔹Miss activities
    const missActivities = useMemo(() => {
        return allActivities.filter(task => {
            if (task.done) return false;
            if (!task.selectedDate) return false;

            return task.selectedDate < todayStr;
        });
    }, [allActivities]);


    // 🔹Done activities
    const doneActivities = useMemo(() => {
        if(!allActivities.length) return [];
        return allActivities.filter((elem) => elem.done)
    },[allActivities])


    //🔹Delete task
    const deleteTask = async (id:string) => {

        const userId = auth.currentUser?.uid
        if(!userId) return

        try {
            const docRef = doc(db, "users", userId, "activities", id)
            await deleteDoc(docRef)
        } catch (error) {
            console.log("Error deleting task", error)
        }

    }


    // 🔹 Color picker
    const getPriorityColor = (priority: "Normal" | "High" | "Highest" = "Normal") => {
        switch (priority) {
            case "High":
            return "rgba(240, 173, 78, 0.3)";
            case "Highest":
            return "rgba(220, 53, 69, 0.3)";
            default:
            return "rgba(95, 173, 241, 0.3)";
        }
    };




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

        <View style={{paddingBottom: 15}}>

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
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View style={{rowGap: 15, borderTopWidth: .5, borderTopColor: "gray", paddingTop: 10}}>
                    {todayActivities && todayActivities.map((elem, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.taskCard, 
                                {
                                    borderColor: darkMode === "dark" ? "#495057" : "black", 
                                    backgroundColor: getPriorityColor(elem.selectedPriority || "Normal")
                                }
                            ]}
                        >
                            <View style={{flexDirection: "row", justifyContent:"space-between", marginRight: 10, marginLeft: 10, marginTop: 10}}>
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
                                <EllipsisVertical 
                                    stroke={darkMode === "dark" ? theme.primary : "black" }
                                    onPress={() => {
                                        setSelectedTask(elem)
                                        setShowEditModal(true)
                                    }}

                                />
                            </View>
                            <View  style={{marginTop: 5}}>

                                <View style={{flexDirection:"row", columnGap: 5, alignItems:"center", marginLeft: 10, marginRight: 10}}>
                                    <TouchableOpacity
                                        style={{
                                            height: 20, 
                                            borderRadius: 10,
                                            borderWidth: 0.5, 
                                            width: 20, 
                                            borderColor: darkMode === "dark" ? "white" : "black",
                                            backgroundColor: elem.done ? "green" : "transparent"
                                        }}
                                        onPress={() => handleTaskComplete(elem.id, !elem.done)}
                                    >
                                    </TouchableOpacity>

                                    <ThemedText variant='subtitleBold' style={{width:"90%"}}>
                                        {elem.activity}
                                    </ThemedText>
                                </View>

                                <ThemedText style={{width:"90%", alignSelf:"center", paddingTop: 5, paddingHorizontal: 10}} variant='smallertitle'>
                                    {elem.note}
                                </ThemedText>

                            </View>

                            <View 
                                style={[styles.taskCardBottom, {backgroundColor: darkMode === "dark" ? "#495057" : "#e9ecef", 
                            }]}>
                                <RedoDot 
                                    size={15}
                                    stroke={darkMode === "dark" ? theme.primary : "black" }
                                />

                                <View style={{flexDirection:"row", columnGap: 5}}>
                                    <Clock size={15} stroke={darkMode === "dark" ? theme.primary : "black" }
                                />
                                    <ThemedText variant='smallertitle'>
                                        {elem.selectedPart}
                                    </ThemedText>
                                </View>
                            </View>

                        </View>
                    ))}

                    <View style={{flexDirection: "row", borderTopWidth: 0.5, paddingTop: 10,  justifyContent: "space-between"}}>
                        <View style={{flexDirection: 'row', columnGap: 7, alignItems: "center"}}>
                            <ClipboardX 
                                stroke="red"
                                size={15}
                            />
                            <ThemedText style={{fontSize: 15}}>Recently Missed Activities</ThemedText>
                        </View>

                        <ChevronDown />
                    </View>

                    {missActivities && missActivities.map((elem, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.taskCard, 
                                {
                                    borderColor: darkMode === "dark" ? "#495057" : "black", 
                                    backgroundColor: "rgba(229, 56, 59, 0.3)"
                                }
                            ]}
                        >
                            
                            <View style={{flexDirection: "row", justifyContent:"space-between", marginRight: 10, marginLeft: 10, marginTop: 10}}>
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
                                <EllipsisVertical 
                                    stroke={darkMode === "dark" ? theme.primary : "black" }
                                    onPress={() => {
                                        setSelectedTask(elem)
                                        setShowEditModal(true)
                                    }}
                                />
                            </View>
                            <View  style={{marginTop: 5}}>

                                <View style={{flexDirection:"row", columnGap: 5, alignItems:"center", marginLeft: 10, marginRight: 10}}>
                                    <TouchableOpacity
                                        style={{
                                            height: 20, 
                                            borderRadius: 10,
                                            borderWidth: 0.5, 
                                            width: 20, 
                                            backgroundColor: elem.done ? "green" : "rgba(239, 35, 60, 0.5)"
                                        }}
                                        onPress={() => deleteTask(elem.id)}
                                    >
                                    </TouchableOpacity>

                                    <ThemedText variant='subtitleBold' style={{width:"90%"}}>
                                        {elem.activity}
                                    </ThemedText>
                                </View>

                                <ThemedText style={{width:"90%", alignSelf:"center", paddingTop: 5, paddingHorizontal: 10}} variant='smallertitle'>
                                    {elem.note}
                                </ThemedText>

                            </View>

                            <View 
                                style={[styles.taskCardBottom, {backgroundColor: "rgba(229, 56, 59, 0.3)"}]}>
                                <RedoDot 
                                    size={15}
                                    stroke={darkMode === "dark" ? theme.primary : "black" }
                                />

                                <View style={{flexDirection:"row", columnGap: 5}}>
                                    <Clock size={15} stroke={darkMode === "dark" ? theme.primary : "black" }
                                />
                                    <ThemedText variant='smallertitle'>
                                        {elem.selectedPart}
                                    </ThemedText>
                                </View>
                            </View>

                        </View>
                    ))}

                    <View style={{flexDirection: "row", borderTopWidth: 0.5, paddingTop: 10,  justifyContent: "space-between"}}>
                        <View style={{flexDirection: 'row', columnGap: 7, alignItems: "center"}}>
                            <ClipboardCheck
                                stroke="green"
                                size={15}
                            />
                            <ThemedText style={{fontSize: 15}}>Done</ThemedText>
                        </View>

                        <ChevronDown />
                    </View>

                    {doneActivities && doneActivities.map((elem, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.taskCard, 
                                {
                                    borderColor: darkMode === "dark" ? "#495057" : "black", 
                                    backgroundColor: "rgba(216, 243, 220, 0.4)"
                                }
                            ]}
                        >
                            
                            <View style={{flexDirection: "row", justifyContent:"space-between", marginRight: 10, marginLeft: 10, marginTop: 10}}>
                                <ThemedText style={{color: "gray"}}>
                                    {elem.isAllDay ? (
                                        <ThemedText variant='smallertitle'>All Day</ThemedText>
                                    ) : elem.selectedPart ? (
                                        <ThemedText variant='smallertitle' style={{color: "gray"}}>{elem.selectedPart}</ThemedText>
                                    ) : (
                                        <View>
                                            <ThemedText variant='smallertitle'>Any Time</ThemedText>
                                        </View>
                                    )}
                                </ThemedText>
                                <EllipsisVertical 
                                    stroke="gray"
                                    onPress={() => {
                                        setSelectedTask(elem)
                                        setShowEditModal(true)
                                    }}
                                />
                            </View>
                            <View  style={{marginTop: 5}}>

                                <View style={{flexDirection:"row", columnGap: 5, alignItems:"center", marginLeft: 10, marginRight: 10}}>
                                    <TouchableOpacity
                                        onPress={() => handleTaskComplete(elem.id, !elem.done)}
                                    >
                                        <SquareCheck 
                                            stroke="rgba(63, 243, 90, 0.8)"
                                        />
                                    </TouchableOpacity>
                                    

                                    <ThemedText variant='subtitleBold' style={styles.lineThrough}>
                                        {elem.activity}
                                    </ThemedText>
                                </View>

                                <ThemedText style={{width:"90%", alignSelf:"center", paddingTop: 5, paddingHorizontal: 10}} variant='smallertitle'>
                                    {elem.note}
                                </ThemedText>

                            </View>

                            <View 
                                style={[styles.taskCardBottom, { backgroundColor: "rgba(216, 243, 220, 0.8)"}]}>
                                <RedoDot 
                                    size={15}
                                    stroke="gray"
                                />

                                <View style={{flexDirection:"row", columnGap: 5}}>
                                    <Clock size={15} stroke="gray"
                                />
                                    <ThemedText variant='smallertitle' style={{color: "gray"}}>
                                        {elem.selectedPart}
                                    </ThemedText>
                                </View>
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

        <EditDeleteModal isVisible={showEditModal} onClose={() => setShowEditModal(false)} />
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
        borderRadius: 10,
        marginBottom: 10,
        minHeight: 60,
    },

    taskCardBottom:{
        flexDirection:"row", 
        justifyContent:"space-between", 
        width:"100%", 
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        padding: 10
    },

    lineThrough: {
        textDecorationLine: 'line-through', 
        textDecorationStyle: 'solid',       
        color: 'gray',  
        width: "90%",
    },
})