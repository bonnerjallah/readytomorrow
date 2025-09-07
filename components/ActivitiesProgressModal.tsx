import { Modal, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'

// ⚛️ STATE MANAGEMENT
import { useTheme } from './ThemeContext'

// 🎨 UI
import ThemedButton from '../components/ThemedButton'
import Spacer from '../components/Spacer'
import ThemedTextInput from '../components/ThemedTextInput'
import ThemedText from '../components/ThemedText'
import ThemedView from '../components/ThemedView'
import { CircleX } from 'lucide-react-native'
import { useEffect, useState } from 'react'

//🧩 COMPONENTS
import PercentageCircle from "../components/PercentageCircle"

//💾 FIREBASE
import {auth, db} from "../firebaseConfig"
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore'

// 🔤 TYPES
type ProgressModalType = {
    isVisible: boolean
    onClose: () => void
}

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


const ActivitiesProgressModal = ({isVisible, onClose}: ProgressModalType) => {

    const {theme} = useTheme()

    const [showProgressBy, setShowProgressBy] = useState<"Last 7 Days" | "Last 30 Days" | "Last 6 Months" | null>("Last 7 Days")
    const [lastSevenDays, setLastSevenDays] = useState<string[]>([])
    const [allActivities, setAllActivities] = useState<ActivityType[]>([])
    const [progressByDay, setProgressByDay] = useState<number[]>([]);
    const [dateRange, setDateRange] = useState<string | undefined>();


    //🔹Activities fetch
    useEffect(() => {
        const userId = auth.currentUser?.uid
        if(!userId) return

        const activitiesCol = collection(db, "users", userId, "activities")
        const q = query(activitiesCol, orderBy("createdAt", "asc"))

        const unsubscribe = onSnapshot(
            q, 
            (snapshot) => {
                const activitiesData: ActivityType[] =  snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as ActivityType[]

                setAllActivities(activitiesData)
            }
        )

        return () => unsubscribe()
    }, [])


    // 🔹Last seven days function
    useEffect(() => {
        const today = new Date();

        // last 7 days labels and dates
        const last7DaysDates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today); // clone
            d.setDate(today.getDate() - i);
            d.setHours(0, 0, 0, 0); // normalize
            return d;
        }).reverse();

        // set labels for display
        const last7DaysLabels = last7DaysDates.map((d) => {
            const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
            return isToday ? "Today" : d.toLocaleDateString(undefined, { weekday: "long" });
        });

        setLastSevenDays(last7DaysLabels);

        // calculate progress
        if (!allActivities.length) {
            setProgressByDay(new Array(7).fill(0));
            return;
        }

        const progress = last7DaysDates.map((d) => {
            const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
            const activitiesForDay = allActivities.filter(act => act.selectedDate === dateStr);
            const total = activitiesForDay.length;
            const completed = activitiesForDay.filter(act => act.done).length;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        });

        setProgressByDay(progress);

    }, [allActivities]);


    useEffect(() => {
        if (!lastSevenDays.length) return;

        const last7DaysDates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(new Date().getDate() - i);
            return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
        }).reverse();

        const firstDate = new Date(last7DaysDates[0]);
        const lastDate = new Date(last7DaysDates[last7DaysDates.length - 1]);

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

        setDateRange(`${firstDate.toLocaleDateString(undefined, options)} – ${lastDate.toLocaleDateString(undefined, options)}`);
    }, [lastSevenDays]);









  return (
    <Modal
        transparent
        visible={isVisible}
        animationType='slide'
    >
        <ThemedView style={styles.container} safe>

            <Spacer height={20} />

            <View style={{flexDirection:"row", alignItems:"center", columnGap:50}}>
                <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
                <ThemedText variant='heading'>Performance</ThemedText>
            </View>

            <Spacer height={10} />

            <ThemedText style={{alignSelf:"center"}}>{dateRange}</ThemedText>

            <Spacer height={15} />

            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                {(["Last 7 Days" , "Last 30 Days" , "Last 6 Months" ]as const).map(elem => (
                    <ThemedText
                        key={elem}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: showProgressBy === elem ? theme.primary : "#adb5bd",
                            borderRadius: 6,
                            textAlign: "center",
                            width:"30%",
                            fontSize: 15
                        }}
                        onPress={() => setShowProgressBy(elem)}
                    >
                        {elem}
                    </ThemedText>
                ))}
            </View>

            <Spacer height={20} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {showProgressBy === "Last 7 Days" ? (
                    <View style={{alignItems:"flex-start", marginLeft: 10, rowGap: 10}}>
                        {lastSevenDays.map((day, idx) => (
                            <View key={day} style={{flexDirection:"row", alignItems:"center", columnGap:10 }}>
                                <PercentageCircle percent={progressByDay[idx] || 0} />
                                <ThemedText>{day}</ThemedText>
                            </View>
                        )).reverse()}
                    </View>

                ) : showProgressBy === "Last 30 Days" ? (
                    <View>

                    </View>
                ) : (
                    <View>

                    </View>
                )}

            </ScrollView>

        </ThemedView>
    </Modal>
   
  )
}

export default ActivitiesProgressModal

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})