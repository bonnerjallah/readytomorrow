import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Image, Animated, TouchableWithoutFeedback, Easing, ActivityIndicator } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { useState } from 'react'
import DateTimePicker from "@react-native-community/datetimepicker";


// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import {ArrowBigLeft, ChevronRight, ImagePlus, Plus } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'

const SetGoals = () => {

    const {theme, darkMode} = useTheme()

    const [selectedDate, setSelectedDate] = useState(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [selectedStartDate, setSelectedStartDate] = useState(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [targetNumber, setTargetNumber] = useState<string>("")
    const [longTerm, setLongTerm] = useState(true)

    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    

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
                    source={require("../../assets/images/Flux.png")} 
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

                <ImagePlus size={35} style={{position: "absolute", right: 10, bottom:-100}} stroke={theme.tabIconColor}/>
            </View>

            <Spacer height={120} />

            <View>
                <ThemedTextInput 
                    placeholder='Enter Goal Name'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
                />

                <Spacer height={15} />

                <ThemedTextInput 
                    placeholder='Enter Note'
                    style={[styles.inputStyle,{backgroundColor:theme.background}]}
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
                            </TouchableOpacity>

                            <Spacer height={15} />

                            <Animated.View style={{ height: dropdowns[1].height, opacity: dropdowns[1].opacity, overflow: "hidden" }}>
                                <DateTimePicker 
                                    value={selectedStartDate ? (() => {
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
                                        setSelectedStartDate(`${year}-${month}-${day}`);
                                        }
                                    }}
                                    style={{ alignSelf: "center" }}
                                />
                            </Animated.View>
                        </View>

                        <Spacer height={15} />

                        <View >

                            <ThemedTextInput
                                keyboardType="numeric"
                                placeholder="Target Number"
                                style={[styles.inputStyle,{backgroundColor:theme.background}]}
                                value={targetNumber}
                                onChangeText={(text) => setTargetNumber(String(text))}
                            />
                        </View>

                    </View>
                    
                    
                </TouchableWithoutFeedback> 
            </View>
        </ScrollView>

        <Spacer height={40} />

        <ThemedButton style={{alignSelf:"center", width: "90%", bottom: 10}}>
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