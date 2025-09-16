import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Image, Animated, TouchableWithoutFeedback, Easing, ActivityIndicator, Alert, Pressable } from 'react-native'
import React, { useEffect } from 'react'
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
import { useAtomValue, useAtom } from 'jotai';
import { GoalIdeaAtom, GoalCategoryAtom } from 'atoms/GoalCategoryAtom';

// 🔥 FIREBASE
import { auth, db } from 'firebaseConfig';
import { collection, doc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

//🔤TYPES
type GoalType = {
  categoryImage: string | null;
  category: string;
  goalName: string;
  note: string;
  selectedPriority: string;
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
    const [selectedPriority, setSelectedPriority] = useState<"Normal" | "High" | "Highest" | "">("Normal");
    const [goalImage, setGoalImage] = useState<string | null>(null)
    const [sugestedGoalIdea, setSugestedGoalIdeaAtom] = useAtom(GoalIdeaAtom);
    const [suggestedCategory, setSuggestedCategoryAtom] = useAtom(GoalCategoryAtom);

    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    

    //🔹Dropdown
    const [dropdowns, setDropdowns] = useState([
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, 
       
    ]);
    const dropdownHeights = [395, 390, 80];

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

    //🔹Pressable helper function
    const handlePriority = (priority: "Normal" | "High" | "Highest") => setSelectedPriority(priority);

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
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission denied!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0].uri
            setGoalImage(selectedImage);
        }
    }

    //🔹selected image value
    const imageSource = (image: string | number | null | undefined) => {
        if (!image) return require("../../assets/images/manwriting.png");
        return typeof image === "number" ? image : { uri: image };
    };

    // store the current image in a variable
    const currentImage = suggestedCategory?.image || goalImage;


    //🔹Submit Goal
    const handleGoalSubmit = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const backupImage = require("../../assets/images/manwriting.png")

            const chosenCategory = suggestedCategory?.title.trim() || category.trim();
            if (!chosenCategory || !(sugestedGoalIdea || goalName.trim())) {
                Alert.alert("All fields are required");
                return;
            }

            // Reference to "goals" collection (categories collection)
            const goalsCol = collection(db, "users", userId, "goals");

            // Category document reference (doc ID = category name)
            const categoryRef = doc(goalsCol, chosenCategory);

            // Upsert category doc
            await setDoc(
                categoryRef,
                {
                    category: category.trim(),
                    categoryImage: suggestedCategory?.image || goalImage || backupImage,
                    createdAt: serverTimestamp(),
                },
                { merge: true } // 👈 merge ensures existing category is not overwritten
            );

            // Add goal under this category
            const categoryGoalsCol = collection(categoryRef, "goal");
            const goalRef = doc(categoryGoalsCol); // auto-ID for each goal

            const goalData: GoalType = {
                category: chosenCategory,
                categoryImage: suggestedCategory?.image ||  goalImage || null,
                goalName: sugestedGoalIdea || goalName.trim(),
                note: note.trim(),
                selectedPriority,
                targetDate: Timestamp.fromDate(new Date(targetDate)),
                startdate: Timestamp.fromDate(new Date(selectedStartDate)),
                longTerm,
                createdAt: serverTimestamp(),
            };

            await setDoc(goalRef, goalData);

            // Reset fields
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(
            today.getMonth() + 1
            ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            setGoalImage(null);
            setCategory("");
            setGoalName("");
            setNote("");
            setTargetDate(todayStr);
            setSelectedStartDate(todayStr);
            setLongTerm(true);
            setSelectedPriority("");
            setSugestedGoalIdeaAtom("");
            setSuggestedCategoryAtom(null );

            router.replace("/Goals");

        } catch (error) {
            console.log("Error submitting goals", error);
        }
    };

    //🔹Clear input filed on back
    const handleClearInputField = () => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        setGoalImage(null);
        setCategory("");
        setGoalName("");
        setNote("");
        setTargetDate(todayStr);
        setSelectedStartDate(todayStr);
        setLongTerm(true);
        setSelectedPriority("");
        setSugestedGoalIdeaAtom("");
        setSuggestedCategoryAtom(null );
    };

    

  return (
    <ThemedView style={styles.container} safe>
        <TouchableOpacity 
            onPress={() => {
                handleClearInputField()
                router.back()
            }}
            style={{
                top:20, 
                left: 10, 
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 40,
                width:50,
            }}
        >
            <ArrowBigLeft size={40} stroke="#77d1d2ff" />
        </TouchableOpacity>

        <ThemedText style={{textAlign: "center"}} variant='title'>Set Goal</ThemedText>

        <Spacer height={20} />

        <ScrollView style={{paddingHorizontal: 10}}>
            <View style={{width: "100%", height:100, alignSelf:"center",}}>
                <Image 
                    source={imageSource(currentImage)} 
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                    onLoadStart={() => {
                        setLoadingImages(prev => ({ ...prev, [currentImage]: true }))
                    }}
                    onLoadEnd={() => {
                        setLoadingImages(prev => ({ ...prev, [currentImage]: false }))
                    }}
                />

                {loadingImages[currentImage] && (
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

                <ThemedTextInput
                    placeholder="Category"
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={category || suggestedCategory?.title || ""}
                    onChangeText={text => setCategory(text)}

                />

                <Spacer height={15} />

                <ThemedTextInput 
                    placeholder='Enter Goal Name'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                    value={ goalName || sugestedGoalIdea || ""}
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
                    <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => toggleDropDown(2)}>
                        <ThemedText variant='subtitle'>Priority</ThemedText>
                        <ThemedText variant='smallertitle'>{selectedPriority}</ThemedText>
                        </TouchableOpacity>

                        <Spacer height={15} />

                        <Animated.View style={{ height: dropdowns[2].height, opacity: dropdowns[2].opacity, overflow: "hidden" }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.2 }}>
                                {["Normal", "High", "Highest"].map((p) => (
                                <Pressable key={p} onPress={() => handlePriority(p as any)} style={({ pressed }) => ({
                                    ...styles.timeOfDaySelector,
                                    marginTop: 20,
                                    borderWidth: 0.2,
                                    borderColor: theme.text,
                                    backgroundColor: pressed || selectedPriority === p ? theme.dropdownBackground : theme.inputBackground
                                })}>
                                    <ThemedText variant="smallertitle">{p}</ThemedText>
                                </Pressable>
                                ))}
                            </View>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>

                <Spacer height={15} />


                <TouchableWithoutFeedback>
                    <View >
                        <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                            <TouchableOpacity 
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 20 }}
                                onPress={() => toggleDropDown(1)}
                                >
                                <ThemedText>Start Date</ThemedText>
                                <View style={{ flexDirection: "row", columnGap: 5, alignItems: "center" }}>
                                    {(() => {
                                    const { weekday, formatedDate } = formatDate(selectedStartDate);
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
                                        const [year, month, day] = selectedStartDate.split("-").map(Number);
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
                                    style={{
                                        alignSelf: "center",
                                        backgroundColor: darkMode === "dark" ? theme.primary : "white",
                                        borderRadius: 10
                                    }}                                
                                />
                            </Animated.View>
                        </View>

                        <Spacer height={15} />

                        <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                            <TouchableOpacity 
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 25 }}
                                onPress={() => toggleDropDown(0)}
                                >
                                <ThemedText>Target Date</ThemedText>

                                {targetDate.length > 0 ? (
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
                                    ) : (
                                    <Plus size={20} stroke={theme.tabIconColor}/>
                                )}

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

                                <Spacer height={15} />

                                <DateTimePicker 
                                    value={targetDate ? (() => {
                                        const [year, month, day] = targetDate.split("-").map(Number);
                                        return new Date(year, month - 1, day);
                                    })() : new Date()}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "inline" : "spinner"}
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

    timeOfDaySelector: { 
        borderRadius: 10, 
        width: "30%", 
        height: 30, 
        alignItems: "center", 
        justifyContent: "center" 
    }


})