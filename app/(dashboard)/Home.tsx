// 🌱 ROOT IMPORTS
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from 'react-native'
import { useEffect, useState, useMemo } from 'react'
import Checkbox from "expo-checkbox";

// 🎨 UI
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { CalendarDays, ChevronDown, CirclePlus, ClipboardCheck, ClipboardList, ClipboardX, SlidersHorizontal, TableOfContents } from 'lucide-react-native'

// 🧩 COMPONENTS
import AddTaskModal from "../../components/AddTaskModal"
import DisplayOptionsModal from "../../components/DisplayOptionsModal"
import HambergurMenuModal from "../../components/HambergurMenuModal"
import ActivityInputModal from "../../components/ActivityInputModal"
import ShowDailyRitualModal from "../../components/ShowDailyRitualModal"
import EditDeleteModal from "../../components/EditDeleteModal"
import Taskcard from "../../components/Taskcard"
import RescheduleModal from "../../components/RescheduleModal"


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
    const [showRedoModal, setShowRedoModal] = useState(false)

    const [showActivityInputModal, setShowActivityInputModal] = useState(false);
    const [showScheduleRoutine, setShowScheduleRoutineModal] = useState(false)
    const [showDailyRitualModal, setShowDailyRitualModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [sortedData, setSortatedData] = useState<ActivityType[] | null>(null)

    // 🔹fetch data state
    const [allActivities, setAllActivities] = useState<ActivityType[]>([]);

    // 🔹 Dropdowns state array
    const [dropdowns, setDropdowns] = useState([
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
    ]);


    const toggleDropDown = (index: number, items: ActivityType[]) => {
        const current = dropdowns[index];
        const ITEM_HEIGHT = 140; // height of a single task card
        const targetHeight = items.length * ITEM_HEIGHT;

        if (current.open) {
            Animated.parallel([
                Animated.timing(current.height, { toValue: 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: false }),
                Animated.timing(current.opacity, { toValue: 0, duration: 150, useNativeDriver: false }),
            ]).start(() => {
                const updated = [...dropdowns];
                updated[index].open = false;
                setDropdowns(updated);
            });
        } else {
            const updated = [...dropdowns];
            updated[index].open = true;
            setDropdowns(updated);
            Animated.parallel([
                Animated.spring(current.height, { toValue: targetHeight, stiffness: 120, damping: 15, mass: 1, useNativeDriver: false }),
                Animated.timing(current.opacity, { toValue: 1, duration: 150, useNativeDriver: false }),
            ]).start();
        }
    };


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
    }, [allActivities, todayStr]);


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


    useEffect(() => {
        setSortatedData(todayActivities); 
    }, [todayActivities]);


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

        let sorted = [...todayActivities];

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
        console.log("value", value)
        if (value === "No Grouping") {
            setSortatedData(todayActivities); 
            return;
        }

        let group = [...todayActivities]

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
                <View>

                    <TouchableOpacity
                        onPress={() => toggleDropDown(0, todayActivities)}
                    >
                        <View style={{flexDirection: "row", borderTopWidth: 0.5, paddingTop: 10, borderTopColor: "gray", justifyContent: "space-between"}}>
                            <View style={{flexDirection: 'row', columnGap: 7, alignItems: "center"}}>
                                <ClipboardList 
                                    stroke={theme.tabIconColor}
                                    size={15}
                                />
                                <ThemedText style={{fontSize: 15}}>New Task</ThemedText>
                            </View>

                            <Animated.View 
                                style={{
                                    transform: [{
                                        rotate: dropdowns[0].open 
                                        ? '180deg' 
                                        : '0deg'   // rotate icon when open
                                    }]
                                }}>
                                <ChevronDown stroke={theme.tabIconColor} />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    <Spacer height={10} />

                    <Animated.View
                        style={{
                            height: dropdowns[0].height,
                            opacity: dropdowns[0].opacity,
                            overflow: 'hidden', // important so content is clipped when closed
                        }}  
                    >
                        {(sortedData ?? todayActivities).map((elem, idx) => (
                            <Taskcard
                                key={elem.id ?? idx}
                                elem={elem}
                                darkMode={darkMode ?? "light"}
                                theme={theme}
                                setSelectedTask={setSelectedTask}
                                setShowEditModal={setShowEditModal}
                                handleTaskComplete={handleTaskComplete}
                                setShowRedoModal={setShowRedoModal}
                            />
                        ))}
                    </Animated.View>

                    <TouchableOpacity
                        onPress={() => toggleDropDown(1, missActivities)}
                    >
                        <View style={{flexDirection: "row", borderTopWidth: 0.5, paddingTop: 10, borderTopColor: "gray", justifyContent: "space-between"}}>
                            <View style={{flexDirection: 'row', columnGap: 7, alignItems: "center"}}>
                                <ClipboardX 
                                    stroke="red"
                                    size={15}
                                />
                                <ThemedText style={{fontSize: 15}}>Recently Missed Activities</ThemedText>
                            </View>

                            <Animated.View 
                                style={{
                                    transform: [{
                                        rotate: dropdowns[1].open 
                                        ? '180deg' 
                                        : '0deg'   // rotate icon when open
                                    }]
                                }}>
                                <ChevronDown stroke={theme.tabIconColor} />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    <Spacer height={10} />
                    
                    <Animated.View
                        style={{
                            height: dropdowns[1].height,
                            opacity: dropdowns[1].opacity,
                            overflow: 'hidden', // important so content is clipped when closed
                        }}
                    >
                        {missActivities && missActivities.map((elem, idx) => (
                             <Taskcard
                                key={elem.id ?? idx}
                                elem={elem}
                                darkMode={darkMode ?? "light"}
                                theme={theme}
                                setSelectedTask={setSelectedTask}
                                setShowEditModal={setShowEditModal}
                                handleTaskComplete={handleTaskComplete}
                                setShowRedoModal={setShowRedoModal}
                                backgroundColor="rgba(255, 77, 109, 0.3)" // ✅ string!
                            />
                        ))}
                    </Animated.View>
                    
                    <TouchableOpacity
                        onPress={() => toggleDropDown(2, doneActivities)}
                    >
                        <View style={{flexDirection: "row", borderTopWidth: 0.5, paddingTop: 10, borderTopColor: "gray",  justifyContent: "space-between"}}>
                            <View style={{flexDirection: 'row', columnGap: 7, alignItems: "center"}}>
                                <ClipboardCheck
                                    stroke="green"
                                    size={15}
                                />
                                <ThemedText style={{fontSize: 15}}>Done Task</ThemedText>
                            </View>

                            <Animated.View 
                                style={{
                                    transform: [{
                                        rotate: dropdowns[2].open 
                                        ? '180deg' 
                                        : '0deg'   // rotate icon when open
                                    }]
                                }}>
                                <ChevronDown stroke={theme.tabIconColor} />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    <Spacer height={10} />
                    
                    <Animated.View
                        style={{
                            height: dropdowns[2].height,
                            opacity: dropdowns[2].opacity,
                            overflow: 'hidden', // important so content is clipped when closed
                        }}
                    >
                        {doneActivities && doneActivities.map((elem, idx) => (
                            <Taskcard
                                key={elem.id ?? idx}
                                elem={elem}
                                darkMode={darkMode ?? "light"}
                                theme={theme}
                                setSelectedTask={setSelectedTask}
                                setShowEditModal={setShowEditModal}
                                handleTaskComplete={handleTaskComplete}
                                setShowRedoModal={setShowRedoModal}
                                backgroundColor='rgba(68, 153, 113, 0.3)'
                                textStyle={styles.lineThrough}
                            />
                        ))}
                    </Animated.View>

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
        <RescheduleModal isVisible={showRedoModal} onClose={() => setShowRedoModal(false)} />
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

    lineThrough: {
        textDecorationLine: 'line-through', 
        textDecorationStyle: 'solid',       
        color: 'gray',  
        width: "90%",
    },
})