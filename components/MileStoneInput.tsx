import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Platform, Easing, Keyboard } from 'react-native'
import React, { useState, useRef } from 'react'
import DateTimePicker from "@react-native-community/datetimepicker";


//⚛️STATE MANAGEMENT
import { useTheme} from './ThemeContext'
import { useAtomValue } from 'jotai';
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom';


//🎨UI
import { ChevronDown, CircleX } from 'lucide-react-native'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import Spacer from './Spacer'
import ThemedTextInput from './ThemedTextInput'
import ThemedButton from './ThemedButton'

//🔥FIREBASE
import {auth, db} from "firebaseConfig"
import { collection, addDoc, serverTimestamp} from 'firebase/firestore';
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet';

//🔤 TYPES
type MileStoneInputType = {
    isVisible: boolean,
    onClose: () => void
}

const MileStoneInput = ({isVisible, onClose}: MileStoneInputType) => {

    const {theme, darkMode} = useTheme()
    
    const selectedGoal = useAtomValue(SelectedGoalAtom)

    const [targetDate, setTargetDate] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });

    const [mileStoneName, setMileStoneName] = useState<string>("")
    const [mileStoneNote, setMileStoneNote] = useState<string>("")

    //🔹Animation state
    const [dropdowns, setDropdowns] = useState([
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
    ]);

    const targetHeight = 375; 

    const toggleDropDown = (index: number) => {
        const current = dropdowns[index];

        if (current.open) {
            // Close dropdown
            Animated.parallel([
                Animated.timing(current.height, {
                    toValue: 0,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false, // height can't use native driver
                }),
                Animated.timing(current.opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: false,
                }),
            ]).start(() => {
            const updated = [...dropdowns];
            updated[index] = { ...updated[index], open: false };
            setDropdowns(updated);
            });
        } else {
            // Open dropdown
            const updated = [...dropdowns];
            updated[index] = { ...updated[index], open: true };
            setDropdowns(updated);

            Animated.parallel([
                Animated.spring(current.height, {
                    toValue: targetHeight,
                    stiffness: 120,
                    damping: 15,
                    mass: 1,
                    useNativeDriver: false,
                }),
                Animated.timing(current.opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    };


    //🔹Milestone submit 
    const handleMileStoneSubmit = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || !selectedGoal?.id) return; // category is not needed

        try {
            // Collection path: users/{userId}/goals/{goalId}/milestones
            const milestoneCol = collection(db, "users", userId, "goals", selectedGoal.category, "goal", selectedGoal.id, "milestones");

            await addDoc(milestoneCol, {
                mileStoneName,
                mileStoneNote,
                targetDate,
                completed: false,
                createdAt: serverTimestamp(),
            });

            // Reset fields
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            setMileStoneName("");
            setMileStoneNote("");
            setTargetDate(todayStr);

            onClose();

        } catch (error) {
            console.log("Error submitting goal milestone", error);
        }
    };





  return (
    <Modal visible={isVisible} onRequestClose={onClose} transparent animationType='slide'>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView style={styles.container} safe>
                <Spacer height={20} />

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
                    <ThemedText style={{ textAlign: "center", width: "83%" }} variant='title'>Add Milestone</ThemedText>
                </View>

                <Spacer height={40} />

                <ThemedTextInput
                    placeholder='Enter Milestone Name'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={mileStoneName}
                    onChangeText={setMileStoneName}
                />

                <Spacer height={20} />

                <ThemedTextInput 
                    placeholder='Enter Note'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={mileStoneNote}
                    onChangeText={setMileStoneNote}
                />

                <Spacer height={20} />

                <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                    <TouchableOpacity
                        onPress={() => toggleDropDown(0)}
                        style={{flexDirection:"row", justifyContent:"space-between", }}
                    >
                        <ThemedText variant='subtitle'>Target Date</ThemedText>

                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: dropdowns[0].open 
                                    ? '180deg' 
                                    : '0deg'   // rotate icon when open
                                }]
                            }}
                        >
                            <ChevronDown size={25} stroke={theme.tabIconColor}/>
                        </Animated.View>
                    </TouchableOpacity>

                    <Spacer height={15} />

                    <Animated.View
                        style={{
                            height: dropdowns[0].height,
                            opacity: dropdowns[0].opacity,
                            overflow: 'hidden', 
                        }}
                    >
                        <View
                            style={{
                            backgroundColor: darkMode === "dark" ? theme.inputBackground : "white",
                            borderRadius: 10,
                            padding: 10,
                            }}
                        >
                            <DateTimePicker
                                value={targetDate ? (() => {
                                    const [year, month, day] = targetDate.split("-").map(Number);
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
                                    setTargetDate(`${year}-${month}-${day}`);
                                    }
                                }}
                                style={{
                                    alignSelf: "center",
                                    backgroundColor: darkMode === "dark" ? theme.primary : "white",
                                    borderRadius: 10
                                }}
                            />
                        </View>
                    </Animated.View>

                </View>
                

                <ThemedButton style={styles.buttonStyle}
                    onPress={handleMileStoneSubmit}
                >
                    <ThemedText style={{color: theme.buttontitle}} variant='button'>Save</ThemedText>
                </ThemedButton>
            </ThemedView>
        </TouchableWithoutFeedback>
        
    </Modal>
  )
}

export default MileStoneInput

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    buttonStyle:{
        position:"absolute",
        bottom: 50, 
        alignSelf: "center",
        width: "90%"
    },
    inputStyle: { 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        elevation: 5, 
        borderRadius: 20, 
        padding: 10 
    },
})