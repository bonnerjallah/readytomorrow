import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { use, useEffect } from 'react'

//🎨 UI
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import {Plus} from 'lucide-react-native'

//⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import BackButton from 'components/BackButton'

//🧩 COMPONENTS
import WeeklyObjectiveCard from 'components/WeeklyObjectiveCard'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// 🔤 TYPE
type weeklyObjectiveType = {
  id: string;
  objectiveName: string;
  createdAt: Date;
};

type weeklyActivityType = {
  id: string;
  activityName: string;
  createdAt: Date;
};

type ActivitiesMap = {
  [objectiveId: string]: weeklyActivityType[];
};

// 🔥 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'




const WeeklyObjectiviesInput = () => {

  const { theme, darkMode } = useTheme()

  const [allWeeklyObjectives, setAllWeeklyObjectives] = React.useState<weeklyObjectiveType[]>([])
  const [activities, setActivities] = React.useState<ActivitiesMap>({})


  // Fetch weekly objectives from Firestore
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const weeklyObjectivesCol = collection(db, "users", userId, "weeklyObjectives");
    const q = query(weeklyObjectivesCol, orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const objectiviesData: weeklyObjectiveType[] = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          objectiveName: data.objectiveName,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), 
        };
      });
      setAllWeeklyObjectives(objectiviesData);
    });

    return () => unsubscribe();
  }, []);


  // Helper function to get the upcoming Saturday from a given date
  function getSaturday(date: Date): Date {
      const newDate = new Date(date);
      const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const diff = 6 - day; // difference in days to Saturday
      newDate.setDate(newDate.getDate() + diff);
      return newDate;
  }

  //Fetxh activities for each weekly objective
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    allWeeklyObjectives.forEach((objective) => {
      const activitiesCol = collection(db, "users", userId, "weeklyObjectives", objective.id, "activities");
      const q = query(activitiesCol, orderBy("createdAt", "asc"), limit(5));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            activityName: data.activityName,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
        });
        setActivities(prev => ({ ...prev, [objective.id]: activitiesData }));
      });

      return () => unsubscribe();
    });

  }, [ allWeeklyObjectives]);





  return (
    <ThemedView style={styles.container} safe>
      <Spacer height={20} />

      <BackButton />

      <ThemedText variant='title' style={{textAlign: "center"}}> Weekly Objectives</ThemedText>

      <Spacer height={20} />

      <ThemedText style={{textAlign: "center"}}>Tap + to add your objectives</ThemedText>

      <Spacer height={20} />

      <View>
        <FlatList
            data={allWeeklyObjectives}
            keyExtractor={(item) => item.id}
            renderItem={({ item}) => {
              return (
                <WeeklyObjectiveCard
                  key={item.id}
                  id={item.id}
                  objectiveName={item.objectiveName}
                  icon={<Plus stroke={darkMode === "dark" ? theme.tabIconColor : "black"} size={25} />}
                  getSatruday={getSaturday(item.createdAt)}
                  activities={activities[item.id] ?? []}
                />
              );
            }}
          />
      </View>
     
    
    </ThemedView>
  )
}

export default WeeklyObjectiviesInput

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})