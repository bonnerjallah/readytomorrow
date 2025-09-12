import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Image, Animated, TouchableWithoutFeedback, Easing, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useState } from 'react'
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from 'expo-image-picker';



// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import {ArrowBigLeft, ChevronRight, ImagePlus, Plus } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'

// 🔥 FIREBASE
import { auth, db } from 'firebaseConfig';
import { collection, doc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';


type GoalType = {
  categoryImage: string | null;
  category: string;
  goalName: string;
  note: string;
  targetDate: Timestamp;
  startdate: Timestamp;
  longTerm: boolean;
  createdAt?: Timestamp | ReturnType<typeof serverTimestamp>; // allow serverTimestamp
};


const SetGoals = () => {

    const {theme, darkMode} = useTheme()

    const [targetDate, setTargetDate] = useState(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [selectedStartDate, setSelectedStartDate] = useState(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [category, setCategory] = useState<string>("")
    const [longTerm, setLongTerm] = useState(true)
    const [goalName, setGoalName] = useState<string>("")
    const [note, setNote] = useState<string>("")
    
    const [goalImage, setGoalImage] = useState<string | null>(null)

    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    

    //🔹Dropdown
    const [dropdowns, setDropdowns] = useState([
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Date
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Part of day
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Time picker
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Duration
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Priority
    ]);
    const dropdownHeights = [330, 330, 350, 200, 80];

    const toggleDropDown = (index: number) => {
    const currentDropdown = dropdowns[index]; // this is the object with open, height, opacity

    if (currentDropdown.open) {
        Animated.parallel([
            Animated.timing(currentDropdown.height, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }),
            Animated.timing(currentDropdown.opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start(() => {
            const updatedDropdowns = [...dropdowns];
            updatedDropdowns[index].open = false;
            setDropdowns(updatedDropdowns);
        });
        } else {
            // opening the dropdown
            const targetHeight = dropdownHeights[index];
            Animated.parallel([
                Animated.timing(currentDropdown.height, {
                    toValue: targetHeight,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(currentDropdown.opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: false,
                }),
            ]).start(() => {
                const updatedDropdowns = [...dropdowns];
                updatedDropdowns[index].open = true;
                setDropdowns(updatedDropdowns);
            });
        }
    };


    //🔹Date Format
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

    //🔹Image Picker
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        })

         if (!result.canceled) {
            const selectedImage = result.assets[0].uri
            setGoalImage(selectedImage);
        }
    }

    //🔹Submit Goal
    const handleGoalSubmit = async () => {
        console.log("submiting goals")

        const userId = auth.currentUser?.uid
        if(!userId) return

        try {

            if (!category.trim() || !goalName.trim() || !note.trim()) {
                Alert.alert("All fields are required");
            return;
    }

            const goalCol = collection(db, "users", userId, "goals")
            const goalRef = doc(goalCol)

            const goalData: GoalType = {
                categoryImage: goalImage,
                category: category.trim(),
                goalName: goalName.trim(),
                note: note.trim(),
                targetDate: Timestamp.fromDate(new Date(targetDate)),
                startdate: Timestamp.fromDate(new Date(selectedStartDate)),
                longTerm,
                createdAt: serverTimestamp(),
            };


            await setDoc(goalRef, goalData)

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            setGoalImage(null);
            setCategory("");
            setGoalName("");
            setNote("");
            setTargetDate(todayStr);
            setSelectedStartDate(todayStr);
            setLongTerm(true);

            router.replace("/Goals")
            
        } catch (error) {
            console.log("Error submiting goals", error)
        }
    }




  return (
    <ThemedView style={styles.container} safe>
        <TouchableOpacity 
            onPress={() => router.back()}
            style={{top:20, left: 10, 
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 40,
                width:"10%"
            }}
        >
            <ArrowBigLeft size={40} stroke="#77d1d2ff" />
        </TouchableOpacity>

        <ThemedText style={{textAlign: "center"}} variant='title'>Set Goal</ThemedText>

        <Spacer height={20} />

        <ScrollView style={{paddingHorizontal: 10}}>
            <View style={{width: "100%", height:100, alignSelf:"center",}}>
                <Image 
                    source={goalImage ? goalImage : require("../../assets/images/manwriting.png")} 
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                    onLoadStart={() => {
                        setLoadingImages(prev => ({ ...prev, flux: true }))
                    }}
                    onLoadEnd={() => {
                        setLoadingImages(prev => ({ ...prev, flux: false }))
                    }}
                />

                {loadingImages.flux && (
                    <ActivityIndicator
                        size="large"
                        color={theme.primary}
                        style={{ position: "absolute", left: 200, top: 70 }} // overlay
                    />
                )}

                <TouchableOpacity onPress={pickImage} style={{position: "absolute", right: 10, bottom:-90}} >
                    <ImagePlus size={35} stroke={theme.tabIconColor} />
                </TouchableOpacity>
            </View>

            <Spacer height={120} />

            <View>

                <View >
                    <ThemedTextInput
                        placeholder="Category"
                        style={[styles.inputStyle,{backgroundColor:theme.background}]}
                        value={category}
                        onChangeText={(text) => setCategory(String(text))}
                    />
                </View>

                <Spacer height={15} />

                <ThemedTextInput 
                    placeholder='Enter Goal Name'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={goalName}
                    onChangeText={(text) => setGoalName(String(text))}
                />

                <Spacer height={15} />

                <ThemedTextInput 
                    placeholder='Enter Note'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={note}
                    onChangeText={(text) => setNote(String(text))}
                />

                <Spacer height={15} />

                <TouchableWithoutFeedback>
                    <View >
                        <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                            <TouchableOpacity 
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 25 }}
                                onPress={() => toggleDropDown(0)}
                                >
                                <ThemedText>Target Date</ThemedText>
                                <Plus size={20} stroke={theme.tabIconColor}/>
                            </TouchableOpacity>


                            <Spacer height={15} />

                            <Animated.View style={{ height: dropdowns[0].height, opacity: dropdowns[0].opacity, overflow: "hidden" }}>

                                <View style={{flexDirection:"row", justifyContent:"space-between"}}>

                                <ThemedButton 
                                    style={{
                                        width: "45%",
                                        height: 45,
                                        alignItems: "center",
                                        backgroundColor: longTerm ? theme.primary : "#ced4da",
                                    }}
                                    onPress={() => setLongTerm(true)}
                                    >
                                    <ThemedText style={{ color: theme.buttontitle, fontSize: 15 }}>
                                        Long Term
                                    </ThemedText>
                                </ThemedButton>

                                <ThemedButton 
                                    style={{
                                        width: "45%",
                                        height: 45,
                                        alignItems: "center",
                                        backgroundColor: !longTerm ? theme.primary : "#ced4da",
                                    }}
                                    onPress={() => setLongTerm(false)}
                                    >
                                    <ThemedText style={{ color: theme.buttontitle, fontSize: 15 }}>
                                        Weekly Objectives
                                    </ThemedText>
                                </ThemedButton>

                                </View>
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
                                    style={{ alignSelf: "center", }}
                                />
                            </Animated.View>
                        </View>

                        <Spacer height={15} />

                        <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                            <TouchableOpacity 
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 20 }}
                                onPress={() => toggleDropDown(1)}
                                >
                                <ThemedText>Start Date</ThemedText>
                                <View style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
                                    {(() => {
                                    const { weekday, formatedDate } = formatDate(targetDate);
                                    return (
                                        <>
                                        <ThemedText variant="smallertitle">{weekday}</ThemedText>
                                        <ThemedText>|</ThemedText>
                                        <ThemedText variant="smallertitle">{formatedDate}</ThemedText>
                                        </>
                                    );
                                    })()}
                                </View>
                            </TouchableOpacity>

                            <Spacer height={15} />

                            <Animated.View style={{ height: dropdowns[1].height, opacity: dropdowns[1].opacity, overflow: "hidden" }}>
                                <DateTimePicker 
                                    value={selectedStartDate ? (() => {
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
                                        setSelectedStartDate(`${year}-${month}-${day}`);
                                        }
                                    }}
                                    style={{ alignSelf: "center" }}
                                />
                            </Animated.View>
                        </View>

                        <Spacer height={15} />

                        

                    </View>
                    
                    
                </TouchableWithoutFeedback> 
            </View>
        </ScrollView>

        <Spacer height={40} />

        <ThemedButton 
            style={{alignSelf:"center", width: "90%", bottom: 10}}
            onPress={handleGoalSubmit}
        
        >
            <ThemedText style={{color:theme.buttontitle}}>Save</ThemedText>
        </ThemedButton>

    </ThemedView>
  )
}

export default SetGoals

const styles = StyleSheet.create({
    container:{
        flex: 1
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