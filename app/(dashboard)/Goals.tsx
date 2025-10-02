//🌱 ROOT IMPORTS
import { StyleSheet, FlatList, View, TouchableOpacity, ScrollView, Pressable, Animated, Alert } from 'react-native'
import React, { use, useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { GestureHandlerRootView } from "react-native-gesture-handler";


// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import { useSetAtom } from 'jotai'
import { GoalsAtom, ObjectiviesAtom, MilestonesAtom } from '../../atoms/GoalCategoryAtom';


// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search, SearchIcon } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'
import { CirclePlus } from 'lucide-react-native'


//🧩 COMPONENTS
import GoalsCard from "../../components/GoalsCard"
import DisplayGoalsOptionModal from "../../components/DisplayGoalsOptionModal" 
import GoalProgressModal from "../../components/GoalProgressModal"
import SwipeableRow from "../../components/SwipeableRow"


//

//🔥 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, getDocs, onSnapshot, Timestamp, query, orderBy, deleteDoc, doc  } from 'firebase/firestore'

type GoalType = {
  id?: string; 
  categoryImage: string | null;
  category: string;
  goalName: string;
  note: string;
  targetDate: Timestamp;
  longTerm: boolean;
  startdate: Timestamp;
  completed: boolean,
  createdAt: Timestamp | null; 
  selectedPriority?: 'Normal' | 'High' | 'Highest' | ''
};

type MilestoneDataType = {
  id: string;
  mileStoneName: string;
  mileStoneNote: string;
  targetDate: string;
  completed: boolean;
  goalId: string;
  createdAt: Timestamp | null;
}

type ObjectiveDataType = {
  id: string;
  objectiveName: string;  
  objectiveNote: string;
  targetDate: string;
  completed: boolean;
  goalId: string;
  createdAt: Timestamp | null;
}


const Goals = () => {

  const {theme, darkMode} = useTheme()
    const rowRef = useRef<any>(null);


  const setGoals = useSetAtom(GoalsAtom);
  const setObjectives = useSetAtom(ObjectiviesAtom);
  const setMilestones = useSetAtom(MilestonesAtom);

  const [showWeekLyObjectivies, setShowWeekLyObjectivies] = useState(false)
  const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
  const [longTermGoals, setLongTermGoals] = useState<GoalType[]>([])
  const [shortTermGoals, setShortTermGoals] = useState<GoalType[]>([])
  const [showGoalsProgressModal, setShowGoalsProgressModal] = useState(false)
  const [allMilestoneData, setAllMilestoneData] = useState<MilestoneDataType[]>([])
  const [mileStoneCompleted, setMilestoneCompleted] = useState<MilestoneDataType[]>([])
  const [allObjectivesData, setAllObjectivesData] = useState<ObjectiveDataType[]>([]);
  const [objectiveCompleted, setObjectiveCompleted] = useState<ObjectiveDataType[]>([])
  const [searchData, setSearchData] = useState<GoalType[]>([])
  const [sortedGoals, setSortedGoals] = useState<GoalType[]>([])
  


  //🔹Animations
  const shortTermAnim = useRef(new Animated.Value(showWeekLyObjectivies ? 1 : 0)).current
  const longTermAnim = useRef(new Animated.Value(showWeekLyObjectivies ? 0 : 1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(shortTermAnim, {
        toValue: showWeekLyObjectivies ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(longTermAnim, {
        toValue: showWeekLyObjectivies ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showWeekLyObjectivies]);

  //🔹Fetch goals
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribes: (() => void)[] = [];

    const fetchGoalsRealTime = async () => {
      try {
        const categoriesCol = collection(db, "users", userId, "goals");
        const categorySnapshot = await getDocs(categoriesCol);

        categorySnapshot.docs.forEach((catDoc) => {
          const goalsCol = collection(catDoc.ref, "goal");
          const unsubscribe = onSnapshot(goalsCol, (snapshot) => {
            const goalsData: (GoalType & { startdateFormatted: string; targetDateFormatted: string })[] = snapshot.docs.map((goalDoc) => {
              const data = goalDoc.data() as GoalType;

              const startdateFormatted = data.startdate instanceof Timestamp
                ? data.startdate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : '';

              const targetDateFormatted = data.targetDate instanceof Timestamp
                ? data.targetDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : '';

              return {
                id: goalDoc.id,
                ...data,
                startdateFormatted,
                targetDateFormatted,
              };
            });

            // Update the atom with all goals from all categories
            setGoals(prev => {
              // remove previous goals from this category
              const otherGoals = prev.filter(g => g.category !== catDoc.id);
              return [...otherGoals, ...goalsData];
            });

            setLongTermGoals(prev => {
              const otherGoals = prev.filter(g => g.category !== catDoc.id && !g.completed); 
              return [...otherGoals, ...goalsData.filter(g => g.longTerm)];
            });

            setShortTermGoals(prev => {
              const otherGoals = prev.filter(g => g.category !== catDoc.id && !g.completed);
              return [...otherGoals, ...goalsData.filter(g => !g.longTerm)];
            });

          });

          unsubscribes.push(unsubscribe);
        });
      } catch (error) {
        console.log("Error fetching goals in real-time:", error);
      }
    };

    fetchGoalsRealTime();

    // Cleanup all listeners on unmount
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  //🔹Fetch milestone
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Store unsubscribe functions for cleanup
    const unsubscribes: (() => void)[] = [];

    const fetchAllMilestones = async () => {
      try {
        // 1️⃣ Fetch all categories once
        const categoriesSnapshot = await getDocs(collection(db, "users", userId, "goals"));

        categoriesSnapshot.forEach(async (categoryDoc) => {
          const categoryId = categoryDoc.id;

          // 2️⃣ Fetch all goals inside this category
          const goalsCol = collection(db, "users", userId, "goals", categoryId, "goal");
          const goalsSnapshot = await getDocs(goalsCol);

          goalsSnapshot.forEach((goalDoc) => {
            const goalId = goalDoc.id;

            // 3️⃣ Listen for milestones in this goal
            const milestonesQuery = query(
              collection(db, "users", userId, "goals", categoryId, "goal", goalId, "milestones"),
              orderBy("createdAt", "asc")
            );

            const unsubscribe = onSnapshot(milestonesQuery, (milestoneSnapshot) => {
              const allMilestones: MilestoneDataType[] = [];

              milestoneSnapshot.forEach((doc) => {
                const data = doc.data();
                allMilestones.push({
                  id: doc.id,
                  goalId,
                  mileStoneName: data.mileStoneName ?? "",
                  mileStoneNote: data.mileStoneNote ?? "",
                  targetDate: data.targetDate ?? null,
                  completed: data.completed ?? false,
                  createdAt: data.createdAt?.toDate?.() ?? new Date(),
                });
              });

              // ✅ Update state only for this goal’s milestones
              setAllMilestoneData((prev) => [
                ...prev.filter((m) => m.goalId !== goalId), // remove old milestones for this goal
                ...allMilestones, // add fresh ones
              ]);
              setMilestoneCompleted((prev) => [
                ...prev.filter((m) => m.goalId !== goalId),
                ...allMilestones.filter((m) => m.completed),
              ]);

              setMilestones((prev) => [
                ...prev.filter((m) => m.goalId !== goalId),
                ...allMilestones,
              ]);
            });

            unsubscribes.push(unsubscribe);
          });
        });
      } catch (err) {
        console.log("Error fetching milestones:", err);
      }
    };

    fetchAllMilestones();

    // Cleanup all listeners on unmount
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [auth.currentUser?.uid]);

  //🔹Fetch Objectives
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribes: (() => void)[] = [];

    const fetchAllObjectives = async () => {
      try {
        // 1️⃣ Fetch all categories
        const categoriesSnapshot = await getDocs(
          collection(db, "users", userId, "goals")
        );

        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryId = categoryDoc.id;

          // 2️⃣ Fetch all goals inside this category
          const goalsCol = collection(
            db,
            "users",
            userId,
            "goals",
            categoryId,
            "goal"
          );
          const goalsSnapshot = await getDocs(goalsCol);

          for (const goalDoc of goalsSnapshot.docs) {
            const goalId = goalDoc.id;

            // 3️⃣ Real-time listener for objectives
            const objectivesQuery = query(
              collection(
                db,
                "users",
                userId,
                "goals",
                categoryId,
                "goal",
                goalId,
                "goalObjectives"
              ),
              orderBy("createdAt", "asc")
            );

            const unsubscribe = onSnapshot(objectivesQuery, (objectiveSnapshot) => {
              const allObjectives: ObjectiveDataType[] = [];

              objectiveSnapshot.forEach((doc) => {
                const data = doc.data();
                allObjectives.push({
                  id: doc.id,
                  goalId,
                  objectiveName: data.objectiveName ?? "",
                  objectiveNote: data.objectiveNote ?? "",
                  targetDate: data.targetDate ?? null,
                  completed: data.completed ?? false,
                  createdAt: data.createdAt?.toDate?.() ?? new Date(),
                });
              });

              // ✅ Update state safely (replace old objectives for this goal)
              setAllObjectivesData((prev) => [
                ...prev.filter((o) => o.goalId !== goalId),
                ...allObjectives,
              ]);

              setObjectiveCompleted((prev) => [
                ...prev.filter((o) => o.goalId !== goalId ),
                ...allObjectives.filter((o) => o.completed),
              ]);

          
              setObjectives((prev) => [
                ...prev.filter((o) => o.goalId !== goalId),
                ...allObjectives,
              ]);
            });

            unsubscribes.push(unsubscribe);
          }
        }
      } catch (err) {
        console.log("Error fetching objectives:", err);
      }
    };

    fetchAllObjectives();

    // Cleanup all listeners on unmount
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [auth.currentUser?.uid]);

  //🔹Goals search funtion
  const handleSearch = (query: string) => {
    const allGoals = [...longTermGoals, ...shortTermGoals];
    const filteredGoals = allGoals.filter(elem => elem.goalName.toLowerCase().includes(query.toLowerCase()));
    setSearchData(filteredGoals);
  }

  //🔹Sorting goals by a-z
  const selectSortBy = (value: 'A-Z' | 'Time' | 'Date') => {
    let baseData: GoalType[] = []

    if(!showWeekLyObjectivies) {
      baseData = [...longTermGoals]; 
    } else {
      baseData = [...shortTermGoals]; 
    }

    if (value === 'A-Z') {
      baseData.sort((a: GoalType, b: GoalType) => 
        a.goalName.localeCompare(b.goalName)
      );
    }

    if (value === 'Time') {
      baseData.sort((a: GoalType, b: GoalType) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Infinity;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Infinity;
        return aTime - bTime;
      });
    }


    if (value === 'Date') {
      baseData.sort((a: GoalType, b: GoalType) => {
        const aDate = a.startdate?.toMillis ? a.startdate.toMillis() : Infinity;
        const bDate = b.startdate?.toMillis ? b.startdate.toMillis() : Infinity;
        return aDate - bDate;
      });
    }


    setSortedGoals(baseData)
  };

  const selectGroupBy = (value: 'Days' | 'Priority' | 'No Grouping') => {
    let baseGroup: GoalType[] = []
    if(!showWeekLyObjectivies) {
      baseGroup = [...longTermGoals]; 
    } else {
      baseGroup = [...shortTermGoals]; 
    }

    if (value === 'No Grouping') {
      setSortedGoals(baseGroup)
      return
    }

    type GroupGoals<T> = T & { groupKey: string }
    let grouped: GroupGoals<GoalType>[] = []

    if (value === 'Days') {
      grouped = baseGroup.map(elem => ({
        ...elem,
        groupKey: elem.startdate
          ? elem.startdate.toDate().toDateString() // ✅ convert Timestamp to Date
          : 'No Data'
      }))
    }

    if (value === 'Priority') {
      const priorityOrder = ['Highest', 'High', 'Normal']
      baseGroup.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.selectedPriority ?? 'Normal')
        const bIndex = priorityOrder.indexOf(b.selectedPriority ?? 'Normal')
        return aIndex - bIndex
      })
      grouped = baseGroup.map(elem => ({ ...elem, groupKey: elem.selectedPriority ?? 'Normal' }))
    }

    setSortedGoals(grouped)

  }

  //🔹Delete task
  const handleDeleteGoal = async (item: GoalType) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !item.id || !item.category) return;

    try {
      // Reference to the goal document
      const goalRef = doc(db, "users", userId, "goals", item.category, "goal", item.id);
      await deleteDoc(goalRef);

      // Check if the category has no more goals
      const goalsCol = collection(db, "users", userId, "goals", item.category, "goal");
      const snapshot = await getDocs(goalsCol);

      if (snapshot.empty) {
        const categoryRef = doc(db, "users", userId, "goals", item.category);
        await deleteDoc(categoryRef);
      }

      router.push("/Goals");
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Could not delete the goal");
    }
  };






  return (
    <ThemedView style={styles.container} safe>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity onPress={() => setShowGoalsProgressModal(true)} >
          <ChartNoAxesColumn size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>

        <ThemedText variant="heading" title>My Goals</ThemedText>

        <TouchableOpacity onPress={() => setShowDisplayOptionModal(true)}>
          <SlidersHorizontal size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>
      </View>

      <Spacer height={30} />

      <View style={{flexDirection:"row", justifyContent:"space-between", columnGap:5}}>
          
        <ThemedButton style={{width: "50%", height: 40, backgroundColor: !showWeekLyObjectivies ? theme.primary : '#adb5bd'}} onPress={() => setShowWeekLyObjectivies(prev => !prev)}>
          <ThemedText variant='smallertitle'>Long-Term </ThemedText>
        </ThemedButton>

        <ThemedButton style={{width: "50%", height: 40, backgroundColor: showWeekLyObjectivies ? theme.primary : '#adb5bd'}} onPress={() => setShowWeekLyObjectivies(prev => !prev)}>
          <ThemedText variant='smallertitle'>Short-Term</ThemedText>
        </ThemedButton>
        
      </View>

      <Spacer  height={20}/>

      <ThemedTextInput 
        style={{backgroundColor:theme.background, alignItems:"center"}}
        placeholder='Search'
        onChangeText={handleSearch}
      >
        <Search  stroke={theme.tabIconColor}/>
      </ThemedTextInput>

      <Spacer height={20} />

      <GestureHandlerRootView>
        <View style={{position:"relative", flex:1}}>
          <Animated.View
            style={{
              opacity: shortTermAnim,
              transform:[
                {translateX: shortTermAnim.interpolate({inputRange: [0, 1], outputRange:[200, 0]})}
              ],
              position:"absolute",
              width:'100%'
            }}
          >
            <FlatList
              data={shortTermGoals}
              keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
              renderItem={({ item, index }) => (
                <SwipeableRow
                  ref={rowRef}
                  id={item.id ?? String(index)}
                  onDelete={(id) => {
                    Alert.alert(
                      "Delete Task",
                      "Are you sure you want to delete task?", 
                      [
                        {text: "NO", style:"cancel", onPress: () => {
                          rowRef.current?.resetSwipe(); // reset swipe back
                        }},
                        {text: "YES", style: "destructive", onPress:() => {
                          handleDeleteGoal({ ...item, id: String(id) })
                        }}
                      ]
                    )
                  }} 
                >
                  <GoalsCard
                    elem={item}
                    allMilestoneData={allMilestoneData}
                    mileStoneCompleted={mileStoneCompleted}
                    allObjectivesData={allObjectivesData}  
                    objectiveCompleted={objectiveCompleted}
                    goalId={item.id}
                  />
                </SwipeableRow>

              )}
              showsVerticalScrollIndicator={false}
            />

          </Animated.View>

          < Animated.View
            style={{
              opacity: longTermAnim,
              transform:[
                {translateX: longTermAnim.interpolate({inputRange: [0, 1], outputRange: [-200, 0]})}
              ],
              width:'100%'
            }}
          >
            <FlatList
              data={searchData.length > 0 ? searchData : sortedGoals.length > 0 ? sortedGoals : longTermGoals}
              keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
              renderItem={({ item, index }) => (
                <SwipeableRow
                  id={item.id ?? String(index)}
                  onDelete={(id) => {
                    Alert.alert(
                      "Delete Task",
                      "Are you sure you want to delete task?", 
                      [
                        {
                          text: "NO",
                          style: "cancel",
                        },
                        {
                          text: "YES",
                          style: "destructive",
                          onPress: () => {
                            handleDeleteGoal({ ...item, id: String(id) });
                          },
                        }
                      ]
                    );
                  }}
                >
                  <GoalsCard
                    elem={item}
                    allMilestoneData={allMilestoneData}
                    mileStoneCompleted={mileStoneCompleted}
                    allObjectivesData={allObjectivesData}  
                    objectiveCompleted={objectiveCompleted}
                    goalId={item.id}
                  />
                </SwipeableRow>
              )}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>       
      </GestureHandlerRootView>
        
              
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

      <DisplayGoalsOptionModal
        isVisible={showDisplayOptionModal}
        onClose={() => setShowDisplayOptionModal(false)}
        selectSortBy={selectSortBy}
        selectGroupBy={selectGroupBy}
      />

      <GoalProgressModal isVisible={showGoalsProgressModal} onClose={() => setShowGoalsProgressModal(false)} />


    </ThemedView>
  )
}

export default Goals

const styles = StyleSheet.create({
  container:{
    flex: 1
  }
})

function setAllActivities(arg0: (prev: any) => any) {
  throw new Error('Function not implemented.');
}
