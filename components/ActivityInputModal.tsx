// 🌱 ROOT IMPORTS
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, Animated, Easing, Switch, TouchableWithoutFeedback, Platform, Pressable, ScrollView } from 'react-native'
import { useState, useRef, useEffect } from 'react';
import {Calendar} from "react-native-calendars"
import DateTimePicker from "@react-native-community/datetimepicker";


// 💾 FIREBASE
import { auth, db } from '../firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'


// ⚛️ STATE MANAGEMENT
import { useTheme } from './ThemeContext';

// 🎨 UI
import Spacer from "../components/Spacer"
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { ChevronUp, CircleX, Plus } from 'lucide-react-native';
import ThemedButton from './ThemedButton';

// 🧩 COMPONENTS
import  CustomWheelPicker  from '../components/CustomePicker';


// 🔤 TYPES
type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};



const ActivityInputModal = ({ isVisible, onClose }: ActivityInputModalProps) => {

  const {theme, darkMode} = useTheme()

  const [activity, setActivity] = useState("")
  const [dateDropDwn, setDateDropDwn] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");  
  const [selectedTime, setSelectedTime] = useState("")  
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false)
  const [reminder, setReminder] = useState(false)
  const [selectedPart, setSelectedPart] = useState<"morning" | "afternoon" | "evening" | "">("");
  const [selectedPriority, setSelectedPriority] = useState<"Normal" | "High" | "Highest" | "">("Normal")
  const [durationDays, setDurationDays] = useState<number>(0);   // default to 1 day
  const [durationHours, setDurationHours] = useState<number>(0); // default to 0 hours
  const [durationMinutes, setDurationMinutes] = useState<number>(0); // default to 0 minutes



  //🔹Drop down function
  const [dropdowns, setDropdowns] = useState([
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // date
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // time part
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // custom time
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // custom date
    { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // priority
  ]);

  const dropdownHeights = [350, 240, 350, 200, 80]; // target heights for each dropdown

  const toggleDropDown = (index: number) => {
    const current = dropdowns[index];
    const targetHeight = dropdownHeights[index];

    if(current.open) {
      // Close
      Animated.parallel([
        Animated.timing(current.height, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(current.opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false
        })
      ]).start(() => {
        const updated = [...dropdowns];
        updated[index].open = false;
        setDropdowns(updated);
      });
    } else {
      // Open
      const updated = [...dropdowns];
      updated[index].open = true;
      setDropdowns(updated);

      Animated.parallel([
        Animated.spring(current.height, {
          toValue: targetHeight, // 🎯 use individual target
          stiffness: 120,
          damping: 15,
          mass: 1,
          useNativeDriver: false
        }),
        Animated.timing(current.opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false
        })
      ]).start();
    }
  };

  
  //🔹Activity input function
  const createActivity = async () => {

    const id = auth.currentUser?.uid
    if(!id) return

    try {
      const activityRef = doc(db, "user", id, "activities", crypto.randomUUID())
      await setDoc(activityRef, {
        activity,
        createdAt: new Date(),
        done: false
      })
      
      setActivity("")
      onClose()
      
    } catch (error) {
      console.log("Error adding task", error)
      Alert.alert("Error", "Could't add activity")
    }
  }

  //🔹Date formating function
  const formatDate = (dateStr? : string) => {
    const dateObj = dateStr? (() => {
      const [year, month, day] = dateStr.split("-").map(Number)
      return new Date(year, month - 1, day)
    })() : new Date()

    const weekday = dateObj.toLocaleDateString("en-US", {weekday:"long"})
    const formatedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })

    return {weekday, formatedDate}
  }

  //🔹Select time of day function
  const handleTimeOfDay = (timeofday: "morning" | "afternoon" | "evening") => {
    setSelectedPart(timeofday); // updates highlight
    console.log("Selected part:", timeofday); // your function logic
  };

  //🔹Handle priority function
  const handlePriority = (priority: "Normal" | "High" |"Highest" ) => {
    setSelectedPriority(priority)
    console.log("selected priority", selectedPriority)
  }
 




  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <ThemedView style={styles.container} safe>
        <ScrollView style={{ flex: 1, padding: 10}}>
          <View style={{flexDirection:"row"}}>
            <CircleX size={40} stroke="#77d1d2ff" onPress={onClose}/>
            <ThemedText style={{textAlign: "center", width: "83%"}} variant='title' title  >Add Activity</ThemedText>
          </View>

          <Spacer height={30} />

          <View>
            <ThemedTextInput 
              placeholder='Enter Activity'
              style = {[styles.inputStyle, {backgroundColor: theme.inputBackground}]}
            />

            <Spacer height={20} />

            <ThemedTextInput 
              placeholder='Enter Note'
              style = {[styles.inputStyle, {backgroundColor: theme.inputBackground}]}
            />

            <Spacer height={20} />

            <TouchableWithoutFeedback onPress={() => setDateDropDwn(false)}>
              <View style={[styles.inputStyle, {backgroundColor: theme.inputBackground, borderRadius:20}]}>

                <TouchableOpacity 
                  style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center", height: 20}}
                  onPress={() => toggleDropDown(0)}
                >
                  <ThemedText variant='subtitle'>Date/Repetition</ThemedText>   

                  <View style={{flexDirection: "row", columnGap: 5, alignItems:"center" }}>
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

                <Spacer height={15}/>
    
                {dropdowns[0].open && (
                  <Animated.View
                    style={{
                      height: dropdowns[0].height,
                      opacity: dropdowns[0].opacity,
                      overflow: "hidden"
                    }}
                  >
                    <View style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
                      <ThemedText variant='subtitle'>Recuring</ThemedText>
                      <Switch 
                        value={isRecurring}
                        onValueChange={setIsRecurring}
                      />
                    </View>

                    <Spacer height={10} />

                    <DateTimePicker
                      value={selectedDate ? new Date(selectedDate) : new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "spinner"}
                      textColor={darkMode === "dark" ? "white" : "black"} 
                      onChange={(_event, date) => {
                        if (date) setSelectedDate(date.toISOString().split("T")[0]);
                      }}
                      style={{ alignSelf:"center" }}
                    />
                  </Animated.View>
                )}
              </View>
            </TouchableWithoutFeedback>

            <Spacer height={20} />

            <TouchableWithoutFeedback>
              <View style={[styles.inputStyle, {backgroundColor: theme.inputBackground, borderRadius:20}]}>
                <TouchableOpacity
                  style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}
                  onPress={() => toggleDropDown(1)}
                >
                  <ThemedText variant='subtitle'>Time</ThemedText>
                  {selectedTime ? (
                    <ThemedText variant='smallertitle'>
                      {new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  ) : (
                    dropdowns[1].open ? (
                      <ChevronUp size={25} stroke={darkMode === "dark" ? "white" : "black"} />
                    ) : (
                      <Plus size={25} stroke={darkMode === "dark" ? "white" : "black"} />
                    )
                  )}

                </TouchableOpacity>

                <Spacer height={15}/>

                {dropdowns[1].open && (
                  <Animated.View style={{ height: dropdowns[1].height, opacity: dropdowns[1].opacity, overflow:"hidden" }}>
                    <View style={{borderTopWidth: 0.2}}>
                      <ThemedText style={{alignSelf: "center", margin: 10}} variant='smallertitle'>Select part of day</ThemedText>

                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {["morning", "afternoon", "evening"].map((part) => (
                          <Pressable
                            key={part}
                            onPress={() => handleTimeOfDay(part as "morning" | "afternoon" | "evening")}
                            style={({ pressed }) => ({
                              ...styles.timeOfDaySelector,
                              borderWidth: 0.2,
                              borderColor: theme.text, // or another color for the border
                              backgroundColor: pressed
                                ? theme.dropdownBackground // background when pressing
                                : selectedPart === part
                                ? theme.dropdownBackground // background stays if selected
                                : theme.inputBackground, // default background
                            })}
                          >
                            <ThemedText variant="smallertitle">
                              {part.charAt(0).toUpperCase() + part.slice(1)}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>


                      <ThemedText style={{alignSelf: "center", margin: 10}}  variant='smallertitle'>or set a specific time</ThemedText>

                      {dropdowns[2].open ? (
                        <>
                          <Animated.View style={{ height: dropdowns[2].height, opacity: dropdowns[2].opacity }}>
                            <DateTimePicker
                              value={selectedTime ? new Date(selectedTime) : new Date()}
                              mode="time"
                              display={Platform.OS === "ios" ? "spinner" : "default"}
                              textColor={darkMode === "dark" ? "white" : "black"} 
                              onChange={(_event, date) => {
                                if (_event.type === "set" && date) {
                                  setSelectedTime(date.toISOString());
                                }
                              }}
                            />
                          </Animated.View>

                          <TouchableOpacity
                            onPress={() => {
                              setSelectedTime(""); 
                              setSelectedPart("")
                              toggleDropDown(2);  
                            }}
                            style={{
                              position:"absolute",
                              bottom: 230,
                              right: 5
                            }}
                          >
                            <ThemedText style={{backgroundColor:theme.primary, padding: 5, borderRadius:10, color: theme.buttontitle}} variant='smallertitle'>Unset
                            </ThemedText>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <ThemedButton style={{ alignSelf: "center", marginTop: 15 }} onPress={() => toggleDropDown(2)}>
                          <ThemedText style={{ color: theme.buttontitle }}>Set Time</ThemedText>
                        </ThemedButton>
                      )}                      
                    </View>
                  </Animated.View>
                )}
              </View>
            </TouchableWithoutFeedback>

            <Spacer height={20} />

            <TouchableWithoutFeedback>
              <View style={[styles.inputStyle, {backgroundColor: theme.inputBackground, borderRadius:20}]}>
                <TouchableOpacity
                  style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}
                  onPress={() => toggleDropDown(3)}
                >
                  <ThemedText variant='subtitle'>Duration</ThemedText>
                  {durationDays || durationHours || durationMinutes ? (
                    <View style={{flexDirection:"row", columnGap: 5}}>
                      <ThemedText variant='smallertitle'>
                        {durationDays + "d"}
                      </ThemedText><ThemedText variant='smallertitle'>
                        {durationHours + "h"}
                      </ThemedText><ThemedText variant='smallertitle'>
                        {durationMinutes + "m"}
                      </ThemedText>
                    </View>
                    
                  ) : (
                    dropdowns[3].open ? (
                      <ChevronUp size={25} stroke={darkMode === "dark" ? "white" : "black"} />
                    ) : (
                      <Plus size={25} stroke={darkMode === "dark" ? "white" : "black"} />
                    )
                  )}

                </TouchableOpacity>

                  <Spacer height={15}/>

                  {dropdowns[3].open && (
                    <Animated.View
                      style={{
                        height: dropdowns[3].height,
                        opacity: dropdowns[3].opacity,
                        overflow: "hidden"
                      }}
                    >
                      <View style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
                        <ThemedText variant='subtitle'>All Day</ThemedText>
                        <Switch 
                          value={isAllDay}
                          onValueChange={setIsAllDay}
                        />
                      </View>

                      <CustomWheelPicker 
                        onValueChange={(days, hours, minutes) => {
                          setDurationDays(days);
                          setDurationHours(hours);
                          setDurationMinutes(minutes);
                        }} 

                          days={durationDays}
                          hours={durationHours}
                          minutes={durationMinutes}

                        onUnset={() => {
                          setDurationDays(0);
                          setDurationHours(0);
                          setDurationMinutes(0);
                        }}
                        
                      />
                    </Animated.View>
                  )}

              </View>

            </TouchableWithoutFeedback>

            <Spacer height={20} />

            <TouchableWithoutFeedback>
              <View style={[styles.inputStyle, {backgroundColor: theme.inputBackground, borderRadius:20}]}>
                <TouchableOpacity
                  style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}
                  onPress={() => toggleDropDown(4)}
                >
                  <ThemedText variant='subtitle'>Priority</ThemedText>
                  {selectedPriority && (
                    <ThemedText variant='smallertitle'>
                      {selectedPriority}
                    </ThemedText>
                  ) }
                </TouchableOpacity>

                  <Spacer height={15}/>

                  {dropdowns[4].open && (
                    <Animated.View
                      style={{
                        height: dropdowns[4].height,
                        opacity: dropdowns[4].opacity,
                        overflow: "hidden"
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.2}}>
                        {["Normal", "High", "Highest"].map((part) => (
                          <Pressable
                            key={part}
                            onPress={() => handlePriority(part as "Normal" | "High" | "Highest")}
                            style={({ pressed }) => ({
                              ...styles.timeOfDaySelector,
                              marginTop: 20,
                              borderWidth: 0.2,
                              borderColor: theme.text, // or another color for the border
                              backgroundColor: pressed
                                ? theme.dropdownBackground // background when pressing
                                : selectedPriority  === part
                                ? theme.dropdownBackground // background stays if selected
                                : theme.inputBackground, // default background
                            })}
                          >
                            <ThemedText variant="smallertitle">
                              {part.charAt(0).toUpperCase() + part.slice(1)}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>

                    </Animated.View>
                  )}

              </View>

            </TouchableWithoutFeedback>

            <Spacer height={20} />

            <View style={[styles.inputStyle, {backgroundColor: theme.inputBackground, borderRadius:20, flexDirection:'row', justifyContent:"space-between"}]}>
              <ThemedText variant='subtitle'>Add a Reminder</ThemedText>
              <Switch 
                value={reminder}
                onValueChange={setReminder}
              />
            </View>


          </View>
        </ScrollView>
      </ThemedView>      
  </Modal>
  )
}

export default ActivityInputModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },

  inputStyle:{
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 20,
    padding: 10,
  },

  timeOfDaySelector:{
    borderRadius: 10, 
    width:"30%", 
    height: 30, 
    alignItems:"center", 
    justifyContent: "center"
  }
})