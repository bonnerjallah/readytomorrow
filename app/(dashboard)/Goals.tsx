//🌱 ROOT IMPORTS
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Pressable, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'

// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import { useSetAtom } from 'jotai'
import { GoalsAtom } from '../../atoms/GoalCategoryAtom';


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

//

//🔥 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, getDocs, onSnapshot, Timestamp,  } from 'firebase/firestore'

type GoalType = {
  id?: string; // optional, since you’re adding doc.id
  categoryImage: string | null;
  category: string;
  goalName: string;
  note: string;
  targetDate: Timestamp;
  longTerm: boolean;
  startdate: Timestamp;
  createdAt: Timestamp | null; // serverTimestamp resolves to this
  selectedPriority?: 'Normal' | 'High' | 'Highest' | ''

};


const Goals = () => {

  const {theme, darkMode} = useTheme()

  const setGoals = useSetAtom(GoalsAtom);

  const [showWeekLyObjectivies, setShowWeekLyObjectivies] = useState(false)
  const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
  const [longTermGoals, setLongTermGoals] = useState<GoalType[]>([])
  const [shortTermGoals, setShortTermGoals] = useState<GoalType[]>([])
  const [showGoalsProgressModal, setShowGoalsProgressModal] = useState(false)



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

    const fetchCategoriesRealtime = async () => {
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
              const otherGoals = prev.filter(g => g.category !== catDoc.id); // remove previous goals from this category
              return [...otherGoals, ...goalsData.filter(g => g.longTerm)];
            });

            setShortTermGoals(prev => {
              const otherGoals = prev.filter(g => g.category !== catDoc.id);
              return [...otherGoals, ...goalsData.filter(g => !g.longTerm)];
            });

          });

          unsubscribes.push(unsubscribe);
        });
      } catch (error) {
        console.log("Error fetching goals in real-time:", error);
      }
    };

    fetchCategoriesRealtime();

    // Cleanup all listeners on unmount
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);




  //🔹Sorting goals by a-z
  // const selectSortBy = (value: 'A-Z' | 'Time' | 'Date') => {
  //   let baseData = [...allGoals]; // shallow copy

  //   if (value === 'A-Z') {
  //     baseData.sort((a: GoalType, b: GoalType) => 
  //       a.goalName.localeCompare(b.goalName)
  //     );
  //   }

  //   if (value === 'Time') {
  //     baseData.sort((a: GoalType, b: GoalType) => {
  //       const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : Infinity;
  //       const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : Infinity;
  //       return aTime - bTime;
  //     });
  //   }


  //   if (value === 'Date') {
  //     baseData.sort((a: GoalType, b: GoalType) => {
  //       const aDate = a.startdate?.toMillis ? a.startdate.toMillis() : Infinity;
  //       const bDate = b.startdate?.toMillis ? b.startdate.toMillis() : Infinity;
  //       return aDate - bDate;
  //     });
  //   }


  //   setSortedGoals(baseData)
  // };

  // const selectGroupBy = (value: 'Days' | 'Priority' | 'No Grouping') => {
  //   let baseGroup = [...allGoals]

  //   if (value === 'No Grouping') {
  //     setSortedGoals(baseGroup)
  //     return
  //   }

  //   type GroupGoals<T> = T & { groupKey: string }
  //   let grouped: GroupGoals<GoalType>[] = []

  //   if (value === 'Days') {
  //     grouped = baseGroup.map(elem => ({
  //       ...elem,
  //       groupKey: elem.startdate
  //         ? elem.startdate.toDate().toDateString() // ✅ convert Timestamp to Date
  //         : 'No Data'
  //     }))
  //   }

  //   if (value === 'Priority') {
  //     const priorityOrder = ['Highest', 'High', 'Normal']
  //     baseGroup.sort((a, b) => {
  //       const aIndex = priorityOrder.indexOf(a.selectedPriority ?? 'Normal')
  //       const bIndex = priorityOrder.indexOf(b.selectedPriority ?? 'Normal')
  //       return aIndex - bIndex
  //     })
  //     grouped = baseGroup.map(elem => ({ ...elem, groupKey: elem.selectedPriority ?? 'Normal' }))
  //   }

  //   setGoals(grouped)

  // }






  return (
    <ThemedView style={styles.container} safe>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity onPress={() => setShowGoalsProgressModal(true)} >
          <ChartNoAxesColumn size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>

        <ThemedText variant="heading">My Goals</ThemedText>

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

      <ScrollView  contentContainerStyle={{ alignItems: 'center'}}>
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
            {shortTermGoals.map((elem, idx) => (
              <GoalsCard 
                key={elem.id ?? idx}
                elem={elem}
              />
            ))}
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
            {longTermGoals.map((elem, idx) => (
              <GoalsCard 
                key={elem.id ?? idx}
                elem={elem}
              />
            ))}
          </Animated.View>
        
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

        <DisplayGoalsOptionModal
        isVisible={showDisplayOptionModal}
        onClose={() => setShowDisplayOptionModal(false)}
        // selectSortBy={selectSortBy}
        // selectGroupBy={selectGroupBy}
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