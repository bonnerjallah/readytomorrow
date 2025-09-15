// 🌱 ROOT IMPORTS
import { StyleSheet, Text, View, Modal, TouchableOpacity, Platform, Alert, Switch} from 'react-native'  
import DateTimePicker from "@react-native-community/datetimepicker";


// 🎨 UI
import ThemedView from './ThemedView'
import ThemedText from './ThemedText'
import ThemedButton from './ThemedButton';
import Spacer from "./Spacer"
import { ArrowBigLeft } from 'lucide-react-native'

// ⚛️ STATEMENT MANAGEMENT
import { useTheme } from './ThemeContext'
import { useAtomValue } from 'jotai'
import { taskAtom } from 'atoms/selectedTaskAtom'   
import { useEffect, useState } from 'react'

// 💾 FIREBASE
import { updateDoc, doc } from 'firebase/firestore';
import{auth, db} from "../firebaseConfig"


type RescheduleModalProps = {
    isVisible: boolean,
    onClose: () => void
}

const RescheduleModal = ({isVisible, onClose}: RescheduleModalProps) => {

    const {theme, darkMode} = useTheme()

    const selectedTask = useAtomValue(taskAtom)

    const [activity, setActivity] = useState("");
    const [note, setNote] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isAllDay, setIsAllDay] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [reminder, setReminder] = useState(false);
    const [selectedPart, setSelectedPart] = useState<"Morning" | "Afternoon" | "Evening" | "">("");
    const [selectedPriority, setSelectedPriority] = useState<"Normal" | "High" | "Highest" | "">("Normal");
    const [durationDays, setDurationDays] = useState<number>(0);
    const [durationHours, setDurationHours] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    

    useEffect(() => {
        if (isVisible && selectedTask) {
        setActivity(selectedTask.activity ?? "");
        setNote(selectedTask.note ?? "");
        setSelectedDate(selectedTask.selectedDate ?? "");
        setSelectedTime(selectedTask.selectedTime ?? "");
        setIsAllDay(selectedTask.isAllDay ?? false);
        setIsRecurring(selectedTask.isRecurring ?? false);
        setReminder(selectedTask.reminder ?? false);

        // Normalize selectedPart to capitalized form
        const partMap: Record<string, "Morning" | "Afternoon" | "Evening" | ""> = {
            morning: "Morning",
            afternoon: "Afternoon",
            evening: "Evening",
            "": ""
        };
        setSelectedPart(partMap[selectedTask.selectedPart?.toLowerCase() ?? ""] ?? "");

        // Normalize selectedPriority
        const priorityMap: Record<string, "Normal" | "High" | "Highest" | ""> = {
            normal: "Normal",
            high: "High",
            highest: "Highest",
            "": ""
        };
        setSelectedPriority(priorityMap[selectedTask.selectedPriority?.toLowerCase() ?? ""] ?? "Normal");

        setDurationDays(selectedTask.durationDays ?? 0);
        setDurationHours(selectedTask.durationHours ?? 0);
        setDurationMinutes(selectedTask.durationMinutes ?? 0);
        }
    }, [selectedTask, isVisible]);



    const formatDate = (dateStr?: string) => {
      const dateObj = dateStr ? (() => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
      })() : new Date();

      return {
        weekday: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
        formatedDate: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      };
    };


    const handleRecheduleSubmit = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        if(!selectedTask?.id) return

        try {
            const activityRef = doc(db, "users", userId, "activities", selectedTask?.id);
            await updateDoc(activityRef, {
                activity: activity.trim(),
                note: note?.trim(),
                selectedDate: selectedDate?.trim(),
                selectedTime,
                isAllDay,
                isRecurring,
                reminder,
                selectedPart,
                selectedPriority,
                durationDays,
                durationHours,
                durationMinutes,
                // don’t reset createdAt when editing! Use updatedAt instead.
                updatedAt: new Date(),
            })


            // Reset local state
            setActivity("");
            setNote("");
            setSelectedDate("");
            setSelectedTime("");
            setIsAllDay(false);
            setIsRecurring(false);
            setReminder(false);
            setSelectedPart("");
            setSelectedPriority("Normal");
            setDurationDays(0);
            setDurationHours(0);
            setDurationMinutes(0);

            onClose();
            
        } catch (error) {
            console.log("Error rescheduling task", error)
            Alert.alert("Error", "Couldn't update activity");
        }
    }





    return (
        <Modal
            transparent 
            visible={isVisible} 
            onRequestClose={onClose} 
            animationType="slide"
        >
        
            <ThemedView style={[{backgroundColor: theme.background, marginTop: 50 }, styles.container]} safe>
                <TouchableOpacity 
                    style={{
                        position: "absolute",
                        top: 45,
                        left: 20
                    }} 
                    onPress={onClose} 
                >
                    <ArrowBigLeft size={40} stroke="#77d1d2ff" />
                </TouchableOpacity>

                <ThemedText style={{alignSelf: "center"}} variant="title">
                    Reschedule Activity
                </ThemedText>
                <Spacer height={50} />

                <View>
                    <View >
                        <View style={{flexDirection: "row", justifyContent:"space-between", marginBottom: 20, paddingHorizontal: 10}}>
                            <ThemedText variant='subtitle'>Recurring</ThemedText>
                            <Switch 
                                value={isRecurring}
                                onValueChange={setIsRecurring}
                            />
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15}}>
                            <ThemedText variant='subtitle'>Date</ThemedText>
                            <View  style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
                                {(() => {
                                    const { weekday, formatedDate } = formatDate(selectedDate);
                                    return (
                                        <>
                                        <ThemedText variant="smallertitle">{weekday}</ThemedText>
                                        <ThemedText>|</ThemedText>
                                        <ThemedText variant="smallertitle">{formatedDate}</ThemedText>
                                        </>
                                    );
                                })()}
                            </View>
                        </View>

                    </View>
                    <DateTimePicker
                        value={selectedDate ? (() => {
                        const [year, month, day] = selectedDate.split("-").map(Number);
                        return new Date(year, month - 1, day);
                        })() : new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "spinner"}
                        textColor={darkMode === "dark" ? "white" : "black"}
                        onChange={(_e, date) => {
                        if (_e.type === "set" && date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            setSelectedDate(`${year}-${month}-${day}`);
                        }
                        }}
                        style={{
                            alignSelf: "center",
                            backgroundColor: darkMode === "dark" ? theme.primary : "white",
                            borderRadius: 10,
                            marginTop: 15
                        }} 
                    />
                </View>

                <Spacer height={25} />

                <ThemedButton
                    style={{alignSelf:"center"}}
                    onPress={() => handleRecheduleSubmit()}
                >
                    <ThemedText>Submit</ThemedText>
                </ThemedButton>

            </ThemedView>

        </Modal>
    )
}

export default RescheduleModal

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})