import {
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    FlatList,
    Alert
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { useState } from "react";

// 🎨 UI
import ThemedText from "components/ThemedText";
import ThemedView from "components/ThemedView";
import Spacer from "components/Spacer";
import ThemedButton from "components/ThemedButton";
import ThemedTextInput from "components/ThemedTextInput";
import { Plus } from "lucide-react-native";
import SwipeableRow from "../../components/SwipeableRow"

// ⚛️ STATE MANAGEMENT
import { useTheme } from "components/ThemeContext";
import { router } from "expo-router";
import { ArrowBigLeft } from "lucide-react-native";

// 🔥 FIREBASE
import { auth, db } from "firebaseConfig";
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc, deleteDoc,getDoc}from "firebase/firestore"
import WeeklyObjectiveCard from "components/WeeklyObjectiveCard";

// 🔤 TYPE
type weeklyObjectiveType = {
  id: string;
  objectiveName: string;
  createdAt?: Date;
  completed?: boolean; // ✅ add this
  icon?: any;
  getSatruday?: Date;
  activities?: ActivityType[];
  onObjectiveCompletion?: (objectiveId: string, isCompleted?: boolean) => void | Promise<void>;
  onActivityCompletion?: (activityId: string, isCompleted?: boolean) => void | Promise<void>;
};




type ActivityType = {
    id: string;
    activityName: string;
    createdAt: Date;
    checked?: boolean;
}

const PlanMyWeek = () => {
  const rowRefs = useRef<Record<string | number, {resetSwipe: () => void}>>({});
  const { theme } = useTheme();

  const [weeklyObjective, setWeeklyObjective] = useState("");
  const [allWeeklyObjectives, setAllWeeklyObjectives] = useState<weeklyObjectiveType[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityType[]>>({});
  


  const handleSubmit = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
      console.log("No user is logged in.");
      return;
      }

      try {
          const trimObjective = weeklyObjective.trim();

          const weeklyObjectivesCol = collection(db, "users", userId, "weeklyObjectives");
          const newObjectiveDoc = doc(weeklyObjectivesCol); 
          await setDoc(newObjectiveDoc, {
              objectiveName: trimObjective,
              createdAt: new Date()
          });
          setWeeklyObjective("");
          Keyboard.dismiss();
      } catch (error) {
      console.error("Error adding weekly objective: ", error);
      }
  };

  // 🔹 Fetch weekly objectives from Firestore
  useEffect(() => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const weeklyObjectivesCol = collection(db, "users", userId, "weeklyObjectives");
      const q = query(weeklyObjectivesCol, orderBy("createdAt", "asc"));

      const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
          const objectivesData: weeklyObjectiveType[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
              id: doc.id,
              objectiveName: data.objectiveName,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              completed: data.completed ?? false,
              };
          }) as weeklyObjectiveType[];
          console.log("weekly objectivies:", objectivesData)
          setAllWeeklyObjectives(objectivesData);
          },
          (error) => console.error("Error fetching weekly objectives:", error)
      );

          return () => unsubscribe();
  }, []);

  //Fetch activities for each weekly objective
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId || allWeeklyObjectives.length === 0) return;

    const unsubscribers = allWeeklyObjectives.map((objective) => {
      const activitiesCol = collection(db, "users", userId, "weeklyObjectives", objective.id, "activities");
      const q = query(activitiesCol, orderBy("createdAt", "asc"), limit(5));
      return onSnapshot(q, (snapshot) => {
        const activitiesData: ActivityType[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            activityName: data.activityName ?? "",
            createdAt: data.createdAt?.toDate?.() || new Date(),
            checked: data.completed ?? data.checked ?? false,
          } as ActivityType;
        });
        setActivities((prev) => ({
          ...prev,
          [objective.id]: activitiesData
        }));
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [allWeeklyObjectives]);


  // Helper function to get the upcoming Saturday from a given date
  function getSaturday(date: Date): Date {
      const newDate = new Date(date);
      const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const diff = 6 - day; // difference in days to Saturday
      newDate.setDate(newDate.getDate() + diff);
      return newDate;
  }

  //handleObjective completed
  const handleObjectiveCompletion = async (objectiveId: string, isCompleted: boolean) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !objectiveId) return;

    try {
      const objectiveRef = doc(db, "users", userId, "weeklyObjectives", objectiveId);
      await setDoc(objectiveRef, { completed: isCompleted }, { merge: true });
      console.log("Objective updated:", objectiveId, isCompleted);
    } catch (error) {
      console.error("Firestore update failed:", error);
    }
  };




  
  // handleActivity completed
  const handleActivityCompletion = async (objectiveId: string, activityId: string, isCompleted: boolean) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !objectiveId || !activityId) return;

    try {
      const activityRef = doc(db, "users", userId, "weeklyObjectives", objectiveId, "activities", activityId);
      await setDoc(activityRef, { completed: isCompleted }, { merge: true });

      // Optionally update local parent state so component stays in sync
      setActivities(prev => ({
        ...prev,
        [objectiveId]: prev[objectiveId].map(a =>
          a.id === activityId ? { ...a, checked: isCompleted } : a
        ),
      }));
    } catch (error) {
      console.error("Error updating activity completion status: ", error);
    }
  };


  // Handle delete weekly objective
  const handleDelete = async (objective: weeklyObjectiveType) => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
          console.log("No user is logged in.");
          return;
      }

      try {
          const objectiveRef = doc(db, "users", userId, "weeklyObjectives", objective.id);
          await deleteDoc(objectiveRef);
      } catch (error) {
          console.error("Error deleting weekly objective: ", error);
      }
  };  



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ThemedView style={styles.container} safe>
            <Spacer height={20} />

            {/* Header */}
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  left: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 40,
                  width: "15%",
                }}
              >
                <ArrowBigLeft size={40} stroke="#77d1d2ff" />
              </TouchableOpacity>

              <ThemedText variant="title">Plan My Week</ThemedText>

              <ThemedButton
                style={{
                  width: "20%",
                  height: 40,
                  alignSelf: "flex-end",
                  marginRight: 20,
                  borderRadius: 20,
                  marginTop: -30,
                }}
                onPress={() => router.push("/(weeklyplanscreen)/WeeklyObjectiviesInput")}
              >
                <ThemedText
                  style={{ color: theme.buttontitle, fontSize: 16 }}
                >
                  Next
                </ThemedText>
              </ThemedButton>
            </View>

            <Spacer height={20} />

            <ThemedText>What do I need to accomplish this week?</ThemedText>
            <Spacer height={20} />

            {/* Input */}
            <ThemedTextInput
              placeholder="Enter your weekly objectives"
              multiline
              style={{
                minHeight: 100,
                textAlignVertical: "top",
                backgroundColor: theme.background,
              }}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={handleSubmit}
              value={weeklyObjective}
              onChangeText={setWeeklyObjective}
            />

            <Spacer height={20} />

            <View style={styles.weeklyplanContainer}>
              <FlatList
                data={allWeeklyObjectives}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                renderItem = {({item, index}) => {
                  const rowId = item.id ?? `index-${index}`;
                  return(
                    <SwipeableRow
                      ref={(ref) => {
                        if(ref) rowRefs.current[rowId] = ref;
                        else delete rowRefs.current[rowId];
                      }}
                      id={rowId}
                      onDelete={(id) => {
                        Alert.alert(
                          "Delete Objective",
                          "Are you sure you want to delete this weekly objective?",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                              onPress:() => {
                                rowRefs.current[id]?.resetSwipe();
                              }
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => {
                                handleDelete({...item, id: rowId});
                              }
                            }
                          ]
                        )
                      }}
                    >
                      <WeeklyObjectiveCard
                        key={rowId}
                        id={item.id}
                        objectiveName={item.objectiveName}
                        completed={item.completed}
                        getSatruday={getSaturday(item.createdAt ?? new Date())}
                        activities={activities[item.id ?? rowId] ?? []}
                        onActivityCompletion={(activityId, isCompleted) => handleActivityCompletion(item.id ?? rowId, activityId, Boolean(isCompleted))}
                        onObjectiveCompletion={(isCompleted) => handleObjectiveCompletion(item.id ?? rowId, Boolean(isCompleted))}
                      />

                    </SwipeableRow>
                  )
                }}
              />
            </View>
          </ThemedView>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  );
};

export default PlanMyWeek;

const styles = StyleSheet.create({
  container: { flex: 1 },
  weeklyplanContainer: { flex: 1 },
});
