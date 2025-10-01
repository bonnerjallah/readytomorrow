import { StyleSheet, Text, View, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

//🎨
import ThemedView from './ThemedView'
import ThemedText from './ThemedText'
import Spacer from './Spacer'
import { CircleX } from 'lucide-react-native'
import ProgressBar from "./ProgressBar"

//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, getDocs, onSnapshot, Timestamp } from 'firebase/firestore'
import { useTheme } from './ThemeContext'

//⚛️STATE MAMAGEMENT
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from '../atoms/GoalCategoryAtom'
import { GoalsAtom } from '../atoms/GoalCategoryAtom'

//🧩 COMPONENTS
import PercentageCircle from "../components/PercentageCircle"

//🔤TYPES
type GoalsProgressModalType  ={
    onClose: () => void,
    isVisible: boolean
}


type DayStats = {
  date: string;
  total: number;
  completed: number;
  percent: number;
};

const GoalProgressModal = ({isVisible, onClose}: GoalsProgressModalType) => {

    const selectedGoal = useAtomValue(SelectedGoalAtom)
    const allUserGoals = useAtomValue(GoalsAtom)
    const {theme} = useTheme()

    const [showProgressBy, setShowProgressBy] = useState<"Last 7 Days" | "Last 30 Days" | "Last 6 Months" | null>("Last 7 Days")
    const [lastSevenDays, setLastSevenDays] = useState<string[]>([])
    const [lastThirtyDays, setlastThirtyDays] = useState<string[]>([])
    const [lastSixMonth, setLastSixMonth] = useState<string[]>([])
    // const [allGoals, setAllActivities] = useState<GoalType[]>([])
    const [progress7Days, setProgress7Days] = useState<number[]>([]);
    const [progress30Days, setProgress30Days] = useState<DayStats[]>([]);
    const [dateRange, setDateRange] = useState<string | undefined>();
    const [progress6Months, setProgress6Months] = useState<DayStats[]>([]);


    // 🔹Last seven days function
    useEffect(() => {
        const today = new Date();

        // last 7 days labels and dates
        const last7DaysDates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            d.setHours(0, 0, 0, 0); // normalize to start of day
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
        if (!allUserGoals.length) {
            setProgress7Days(new Array(7).fill(0));
            return;
        }

        const progress = last7DaysDates.map((d) => {
            const startOfDay = new Date(d);
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);

            // filter by createdAt falling inside that day
            const goalForTheDay = allUserGoals.filter((act) => {
            if (!act.createdAt) return false;
            const created = act.createdAt && typeof act.createdAt.toDate === "function"
                ? act.createdAt.toDate()
                : (act.createdAt as Timestamp).toDate();
            return created >= startOfDay && created <= endOfDay;
            });

            console.log("goal for the day", goalForTheDay)


            const total = goalForTheDay.length;
            const completed = goalForTheDay.filter((elem) => elem.completed).length;

            return total > 0 ? Math.round((completed / total) * 100) : 0;
        });

        setProgress7Days(progress);
    }, [allUserGoals]);

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
       if (!allUserGoals.length) {
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
            const goalForTheDay = allUserGoals.filter(act => {
                let actDateStr: string | undefined;
                if (act.startdate && typeof act.startdate.toDate === "function") {
                    actDateStr = act.startdate.toDate().toISOString().split("T")[0];
                } else if (typeof act.startdate === "string") {
                    actDateStr = act.startdate;
                }
                return actDateStr === dateStr;
            });
            const total = goalForTheDay.length;
            const completed = goalForTheDay.filter(act => act.completed).length;
            return {
                date: dateStr,
                total,
                completed,
                percent: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        });

        setProgress30Days(progress);

    }, [allUserGoals])

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

            const activitiesForMonth = allUserGoals.filter(act => {
                if (!act.startdate) return false;
                let actDate: Date;
                if (act.startdate && typeof act.startdate.toDate === "function") {
                    actDate = act.startdate.toDate();
                } else if (typeof act.startdate === "string" || typeof act.startdate === "number") {
                    actDate = new Date(act.startdate);
                } else {
                    actDate = (act.startdate as Timestamp).toDate();
                }
                return actDate.getMonth() === month && actDate.getFullYear() === year;
            });

            const total = activitiesForMonth.length;
            const completed = activitiesForMonth.filter(act => act.completed).length;

            return { date: `${year}-${month + 1}`, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
        });

        setProgress6Months(progress);

    }, [allUserGoals]);




  return (
    <Modal transparent animationType='slide' visible={isVisible}>
        <ThemedView style={styles.container} safe>
            <Spacer height={20} />

            <View style={{flexDirection:"row", alignItems:"center", columnGap:50, }}>
                <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
                <ThemedText variant='heading'> Goals Pogress</ThemedText>
            </View>

            <Spacer height={20} />

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

export default GoalProgressModal

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})