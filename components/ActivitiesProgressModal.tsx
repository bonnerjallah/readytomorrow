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

type DayStats = {
  date: string;
  total: number;
  completed: number;
  percent: number;
};


const ActivitiesProgressModal = ({isVisible, onClose}: ProgressModalType) => {

    const {theme} = useTheme()

    const [showProgressBy, setShowProgressBy] = useState<"Last 7 Days" | "Last 30 Days" | "Last 6 Months" | null>("Last 7 Days")
    const [lastSevenDays, setLastSevenDays] = useState<string[]>([])
    const [lastThirtyDays, setlastThirtyDays] = useState<string[]>([])
    const [lastSixMonth, setLastSixMonth] = useState<string[]>([])
    const [allActivities, setAllActivities] = useState<ActivityType[]>([])
    const [progress7Days, setProgress7Days] = useState<number[]>([]);
    const [progress30Days, setProgress30Days] = useState<DayStats[]>([]);
    const [dateRange, setDateRange] = useState<string | undefined>();
    const [progress6Months, setProgress6Months] = useState<DayStats[]>([]);



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
            setProgress7Days(new Array(7).fill(0));
            return;
        }

        const progress = last7DaysDates.map((d) => {
            const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
            const activitiesForDay = allActivities.filter(act => act.selectedDate === dateStr);
            const total = activitiesForDay.length;
            const completed = activitiesForDay.filter(act => act.done).length;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        });

        setProgress7Days(progress);

    }, [allActivities]);

    //🔹Hader date display
    useEffect(() => {
        const today = new Date();
        let startDate: Date;
        let endDate: Date = today;

        if (showProgressBy === "Last 7 Days") {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6); // 7 days total
        } else if (showProgressBy === "Last 30 Days") {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29); // 30 days total
        } else if (showProgressBy === "Last 6 Months") {
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 5); // 6 months total
        } else return;

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        setDateRange(`${startDate.toLocaleDateString(undefined, options)} – ${endDate.toLocaleDateString(undefined, options)}`);
    }, [showProgressBy]);

    //🔹Last 30 days
    useEffect(() => {
        const today = new Date()
        
        // Get full date
        const lastThirtyDate = Array.from({length: 30}, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            d.setHours(0, 0, 0, 0)
            return d
        }).reverse()


        //Get days
        const lastThirtDays = lastThirtyDate.map(elem => {
            const isToday =
            elem.getDate() === today.getDate() &&
            elem.getMonth() === today.getMonth() &&
            elem.getFullYear() === today.getFullYear()
            return isToday ? "Today" : elem.toLocaleDateString(undefined, {  month: "long", day: "numeric" });
        })

        setlastThirtyDays(lastThirtDays)

        // calculate progress
       if (!allActivities.length) {
            setProgress30Days(
                Array.from({ length: 30 }, (_, i) => ({
                date: lastThirtyDate[i].toISOString().split("T")[0],
                total: 0,
                completed: 0,
                percent: 0
                }))
            );
            return;
        }

        const progress = lastThirtyDate.map((d) => {
            const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
            const activitiesForDay = allActivities.filter(act => act.selectedDate === dateStr);
            const total = activitiesForDay.length;
            const completed = activitiesForDay.filter(act => act.done).length;
            return {
                date: dateStr,
                total,
                completed,
                percent: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        });

        setProgress30Days(progress);

    }, [allActivities])

    // 🔹Last 6 months
    useEffect(() => {
        const today = new Date();

        // Generate the last 6 months
        const lastSixMonthsDates = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            d.setDate(1); // start of month
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        // Labels: month names
        setLastSixMonth(lastSixMonthsDates.map(d =>
            d.toLocaleDateString(undefined, { month: "long" })
        ));

        // Calculate total activities and completion per month
        const progress = lastSixMonthsDates.map((d) => {
            const month = d.getMonth();
            const year = d.getFullYear();

            const activitiesForMonth = allActivities.filter(act => {
                if (!act.selectedDate) return false;
                const actDate = new Date(act.selectedDate);
                return actDate.getMonth() === month && actDate.getFullYear() === year;
            });

            const total = activitiesForMonth.length;
            const completed = activitiesForMonth.filter(act => act.done).length;

            return { date: `${year}-${month + 1}`, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
        });

        setProgress6Months(progress);

    }, [allActivities]);






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
                            <View key={idx} style={{flexDirection:"row", alignItems:"center", columnGap:10, borderBottomWidth:.3,  borderBottomColor: theme.placeholder, width:"100%" , paddingBottom:15 }}>
                                <PercentageCircle percent={progress7Days[idx] || 0} />
                                <ThemedText>{day}</ThemedText>
                            </View>
                        )).reverse()}
                    </View>

                ) : showProgressBy === "Last 30 Days" ? (
                    <View style={{alignItems:"flex-start", marginLeft: 10, rowGap: 10}}>
                       {lastThirtyDays.map((day, idx) => (
                        <View key={idx} style={{flexDirection:"row", alignItems:"center", borderBottomWidth:.3, width:"100%", paddingBottom:15, columnGap: 15, borderBottomColor: theme.placeholder}}>
                            <PercentageCircle percent={progress30Days[idx]?.percent ?? 0} />
                            <View style={{columnGap:10 }}>
                                <ThemedText>{day}</ThemedText>
                                <ThemedText> {progress30Days[idx]?.completed ?? 0} of {progress30Days[idx]?.total ?? 0} Activities</ThemedText>
                            </View>
                        </View>
                       )).reverse()} 
                    </View>
                ) : (
                    <View style={{alignItems:"flex-start", marginLeft: 10, rowGap: 10}}>
                        {lastSixMonth.map((day, idx) => (
                            <View key={idx} style={{flexDirection:"row", alignItems:"center", borderBottomWidth:.3, width:"100%", paddingBottom:15, columnGap: 15, borderBottomColor: theme.placeholder}}>
                                <PercentageCircle percent={progress6Months[idx]?.percent ?? 0} />
                                <View style={{columnGap:10 }}>
                                    <ThemedText>{day}</ThemedText>
                                    <ThemedText>
                                        {progress6Months[idx]?.completed ?? 0} of {progress6Months[idx]?.total ?? 0}
                                    </ThemedText>
                                </View>
                            </View>
                        )).reverse()}
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