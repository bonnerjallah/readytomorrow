  // 🌱 ROOT IMPORTS
  import { StyleSheet, View, Modal, TouchableOpacity, Alert, Animated, Easing, Switch, TouchableWithoutFeedback, Platform, Pressable, ScrollView } from 'react-native'
  import { useState, useEffect } from 'react';
  import DateTimePicker from "@react-native-community/datetimepicker";

  // 💾 FIREBASE
  import { auth, db } from '../firebaseConfig'
  import { collection, doc, setDoc } from 'firebase/firestore'

  // ⚛️ STATE MANAGEMENT
  import { useTheme } from './ThemeContext';

  // 🎨 UI
  import Spacer from "../components/Spacer"
  import ThemedView from './ThemedView';
  import ThemedText from './ThemedText';
  import ThemedTextInput from './ThemedTextInput';
  import { ChevronUp, Plus, CircleX } from 'lucide-react-native';
  import ThemedButton from './ThemedButton';

  // 🧩 COMPONENTS
  import CustomWheelPicker from '../components/CustomePicker';
import Checkbox from 'expo-checkbox';

  // 🔤 TYPES
  type ActivityInputModalProps = {
    isVisible: boolean;
    onClose: () => void;
    selectedOption: string;
  };

  const ActivityInputModal = ({ isVisible, onClose, selectedOption}: ActivityInputModalProps) => {
    const { theme, darkMode } = useTheme();

    const [activity, setActivity] = useState("");
    const [note, setNote] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    });
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isAllDay, setIsAllDay] = useState(false);
    const [isRecurring, setIsRecurring] = useState(true);
    const [reminder, setReminder] = useState(false);
    const [selectedPart, setSelectedPart] = useState<"Morning" | "Afternoon" | "Evening" | "">("");
    const [selectedPriority, setSelectedPriority] = useState<"Normal" | "High" | "Highest" | "">("Normal");
    const [durationDays, setDurationDays] = useState<number>(0);
    const [durationHours, setDurationHours] = useState<number>(0);
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    const [recurringOption, setRecurringOption] = useState<"Daily" | "Weekly" | "Monthly" | null>("Daily");
    const [dayOfTheWeek, setDayOfTheWeek] = useState<string[]>(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [timesPerWeek, setTimesPerWeek] = useState<number>(0)



    // 🔹 Dropdowns state array
    const [dropdowns, setDropdowns] = useState([
      { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Date
      { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Part of day
      { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Time picker
      { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Duration
      { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) }, // Priority
    ]);
    const dropdownHeights = [350, 240, 350, 200, 80];

    const toggleDropDown = (index: number) => {
      const current = dropdowns[index];
      const targetHeight = index === 3 && isAllDay ? 50 : dropdownHeights[index];

      if (current.open) {
        Animated.parallel([
          Animated.timing(current.height, { toValue: 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(current.opacity, { toValue: 0, duration: 150, useNativeDriver: false }),
        ]).start(() => {
          const updated = [...dropdowns];
          updated[index].open = false;
          setDropdowns(updated);
        });
      } else {
        const updated = [...dropdowns];
        updated[index].open = true;
        setDropdowns(updated);
        Animated.parallel([
          Animated.spring(current.height, { toValue: targetHeight, stiffness: 120, damping: 15, mass: 1, useNativeDriver: false }),
          Animated.timing(current.opacity, { toValue: 1, duration: 150, useNativeDriver: false }),
        ]).start();
      }
    };

    useEffect(() => {
      const index = 3; // Duration dropdown
      if (dropdowns[index].open) {
        Animated.timing(dropdowns[index].height, { toValue: isAllDay ? 50 : dropdownHeights[3], duration: 250, useNativeDriver: false }).start();
      }
    }, [isAllDay]);


    useEffect(() => {
        setActivity(selectedOption); 
    }, [selectedOption]);

    // 🔹 Handlers
    const handleTimeOfDay = (part: "Morning" | "Afternoon" | "Evening") => setSelectedPart(part);
    const handlePriority = (priority: "Normal" | "High" | "Highest") => setSelectedPriority(priority);

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

    const createRoutine = async () => {
      if (!activity) return Alert.alert("Must enter activity");

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const cleanActivity = activity.trim();

      // Optional: remove hidden characters that may break Hermes because of emojis
      const sanitizedActivity = cleanActivity.replace(/[\u200B-\u200D\uFEFF]/g, ''); 

      try {
        const activitiesCol = collection(db, "users", userId, "routines");
        const activityRef = doc(activitiesCol);

        await setDoc(activityRef, {
          routine: sanitizedActivity,
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
          recurringOption,
          dayOfTheWeek,
          selectedDays,
          timesPerWeek,
          createdAt: new Date(),
          done: false
        });



        // Reset
        setActivity("");
        setNote("");
        setSelectedDate(() => {
          const today = new Date();
          return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        });
        setSelectedTime("");
        setIsAllDay(false);
        setIsRecurring(false);
        setReminder(false);
        setSelectedPart("");
        setSelectedPriority("Normal");
        setDurationDays(0);
        setDurationHours(0);
        setDurationMinutes(0);
        setRecurringOption(null);
        setDayOfTheWeek(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]); 
        setSelectedDays([]); 
        setTimesPerWeek(1); 
        onClose();
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Couldn't add activity");
      }
    };

    return (
      <Modal visible={isVisible} animationType="slide" transparent>
        <ThemedView style={styles.container} safe>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CircleX size={40} stroke="#77d1d2ff" onPress={() => {onClose(); setActivity("")}} />
            <ThemedText style={{ textAlign: "center", width: "83%" }} variant='title'>Schedule Routine</ThemedText>
          </View>

          <ScrollView style={{ flex: 1, padding: 10 }} showsVerticalScrollIndicator={false}>
            <Spacer height={30} />

            {/* Activity & Note Inputs */}
            <ThemedTextInput placeholder='Enter Routine' value={activity} onChangeText={setActivity} autoCapitalize="sentences" style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]} />
            
            <Spacer height={20} />

            <ThemedTextInput placeholder='Enter Note' value={note} onChangeText={setNote} style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]} />
            
            <Spacer height={20} />

            {/* Date Picker */}
            <TouchableWithoutFeedback>
              
              <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>

                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 20 }} onPress={() => toggleDropDown(0)}>
                  <ThemedText variant='subtitle'>Date/Repetition</ThemedText>
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

                <Animated.View style={{ height: dropdowns[0].height, opacity: dropdowns[0].opacity, overflow: "hidden" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <ThemedText variant='subtitle'>Recurring</ThemedText>
                    <Switch value={isRecurring} onValueChange={setIsRecurring} />
                  </View>

                  <Spacer height={10} />

                  {isRecurring ? (
                    <View>
                      {/* Recurring Options */}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                        {(["Daily", "Weekly", "Monthly"] as const).map(option => (
                          <ThemedText
                            key={option}
                            onPress={() => setRecurringOption(option)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              backgroundColor: recurringOption === option ? theme.primary : theme.button,
                              borderRadius: 6,
                              textAlign: "center",
                              width:"30%"
                            }}
                          >
                            {option}
                          </ThemedText>
                        ))}
                      </View>

                      {/* Daily */}
                      {recurringOption === "Daily" && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent:'space-between' }}>
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <View key={day} style={{ alignItems: "center", margin: 4}}>
                              <ThemedText style={{marginBottom: 10}}>{day}</ThemedText>
                              <Checkbox 
                                value={dayOfTheWeek.includes(day)}
                                onValueChange={() => {
                                  if(dayOfTheWeek.includes(day)){
                                    setDayOfTheWeek(dayOfTheWeek.filter(d => d !== day));
                                  } else {
                                    setDayOfTheWeek([...dayOfTheWeek, day]);
                                  }
                                }}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                              />
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Monthly */}
                      {recurringOption === "Monthly" && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 10}}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(num => {
                            const isSelected = selectedDays.includes(num);
                            return (
                              <TouchableOpacity
                                key={num}
                                onPress={() => {
                                  setSelectedDays(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
                                }}
                                style={{
                                  width: "10%",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: "#ccc",
                                  backgroundColor: isSelected ? theme.primary : "white",
                                  margin: 2
                                }}
                              >
                                <ThemedText style={{ color: isSelected ? "white" : "black" }}>{num}</ThemedText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}

                      {/* Weekly (optional, you can add weekdays similar to Daily) */}
                      {recurringOption === "Weekly" && (
                        <View>
                          <ThemedText variant='smallertitle' style={{alignSelf:"center"}}>Frequency per week</ThemedText>
                          <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            style={{ marginTop: 10, maxHeight: 210, width:"30%", alignSelf:"center"}} 
                          >
                            {Array.from({ length: 7 }, (_, i) => i + 1).map(num => {
                              const selected = num === timesPerWeek;
                              return (
                                <TouchableOpacity
                                  key={num}
                                  onPress={() => setTimesPerWeek(num)}
                                  style={{
                                    padding: 15,
                                    marginVertical: 5,
                                    borderRadius: 8,
                                    alignItems: "center",
                                    backgroundColor: selected ? theme.primary : theme.button,
                                  }}
                                >
                                  <ThemedText style={{ color: selected ? "white" : "black", fontSize: 16 }}>
                                    {num}
                                  </ThemedText>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  ) : (
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
                      style={{ alignSelf: "center" }}
                    />
                  )}


                 

                </Animated.View>
              </View>
            </TouchableWithoutFeedback>

            {/* Time Picker / Part of Day */}
            {!isAllDay && (
              <>
                <Spacer height={20} />
                <TouchableWithoutFeedback>
                  <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                    <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => toggleDropDown(1)}>
                      <ThemedText variant='subtitle'>Time</ThemedText>
                      {selectedTime ? (
                        <ThemedText variant='smallertitle'>{new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                      ) : dropdowns[1].open ? <ChevronUp size={25} stroke={darkMode === "dark" ? "white" : "black"} /> : <Plus size={25} stroke={darkMode === "dark" ? "white" : "black"} />}
                    </TouchableOpacity>

                    <Spacer height={15} />

                    {/* Part of Day Selection */}
                    <Animated.View style={{ height: dropdowns[1].height, opacity: dropdowns[1].opacity, overflow: "hidden" }}>
                      <ThemedText style={{ alignSelf: "center", marginBottom: 10 }} variant="smallertitle">Select part of day</ThemedText>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {["Morning", "Afternoon", "Evening"].map((part) => (
                          <Pressable
                            key={part}
                            onPress={() => handleTimeOfDay(part as "Morning" | "Afternoon" | "Evening")}
                            style={({ pressed }) => ({
                              ...styles.timeOfDaySelector,
                              borderWidth: 0.2,
                              borderColor: theme.text,
                              backgroundColor: pressed ? theme.dropdownBackground : selectedPart === part ? theme.dropdownBackground : theme.inputBackground
                            })}
                          >
                            <ThemedText variant="smallertitle">{part}</ThemedText>
                          </Pressable>
                        ))}
                      </View>

                      <ThemedText style={{ alignSelf: "center", marginVertical: 10 }} variant="smallertitle"> 
                        or set a specific time 
                      </ThemedText>

                      {/* Time Picker */}
                      {dropdowns[2].open ? (
                        <Animated.View style={{ opacity: dropdowns[2].opacity }}>
                          <DateTimePicker
                            value={selectedTime ? new Date(selectedTime) : new Date()}
                            mode="time"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            textColor={darkMode === "dark" ? "white" : "black"}
                            onChange={(_e, date) => {
                              if (_e.type === "set" && date) setSelectedTime(date.toISOString());
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => { setSelectedTime(""); setSelectedPart(""); toggleDropDown(2); }}
                            style={{ marginTop: 10, position: 'absolute', bottom: 75, right:5}}
                          >
                            <ThemedText style={{ backgroundColor: theme.primary, padding: 5, borderRadius: 10, color: theme.buttontitle }} variant="smallertitle">Unset</ThemedText>
                          </TouchableOpacity>
                        </Animated.View>
                      ) : (
                        <ThemedButton style={{ alignSelf: "center", marginTop: 15 }} onPress={() => toggleDropDown(2)}>
                          <ThemedText style={{ color: theme.buttontitle }}>Set Time</ThemedText>
                        </ThemedButton>
                      )}
                    </Animated.View>
                  </View>
                </TouchableWithoutFeedback>
              </>
            )}

            {/* Duration */}
            <Spacer height={20} />
            <TouchableWithoutFeedback>
              <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => toggleDropDown(3)}>
                  <ThemedText variant='subtitle'>Duration</ThemedText>
                  {durationDays || durationHours || durationMinutes ? (
                    <View style={{ flexDirection: "row", columnGap: 5 }}>
                      <ThemedText variant='smallertitle'>{durationDays}d</ThemedText>
                      <ThemedText variant='smallertitle'>{durationHours}h</ThemedText>
                      <ThemedText variant='smallertitle'>{durationMinutes}m</ThemedText>
                    </View>
                  ) : dropdowns[3].open ? <ChevronUp size={25} stroke={darkMode === "dark" ? "white" : "black"} /> : <Plus size={25} stroke={darkMode === "dark" ? "white" : "black"} />}
                </TouchableOpacity>

                <Spacer height={15} />

                <Animated.View style={{ height: dropdowns[3].height, opacity: dropdowns[3].opacity, overflow: "hidden" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <ThemedText variant='subtitle'>All Day</ThemedText>
                    <Switch value={isAllDay} onValueChange={(v) => { setIsAllDay(v); if (v) { setSelectedTime(""); setSelectedPart(""); setDurationDays(0); setDurationHours(0); setDurationMinutes(0); } }} />
                  </View>

                  {!isAllDay && <CustomWheelPicker
                    days={durationDays} hours={durationHours} minutes={durationMinutes}
                    onValueChange={(d, h, m) => { setDurationDays(d); setDurationHours(h); setDurationMinutes(m); }}
                    onUnset={() => { setDurationDays(0); setDurationHours(0); setDurationMinutes(0); }}
                  />}
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>

            {/* Priority */}
            <Spacer height={20} />
            <TouchableWithoutFeedback>
              <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20 }]}>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} onPress={() => toggleDropDown(4)}>
                  <ThemedText variant='subtitle'>Priority</ThemedText>
                  <ThemedText variant='smallertitle'>{selectedPriority}</ThemedText>
                </TouchableOpacity>

                <Spacer height={15} />

                <Animated.View style={{ height: dropdowns[4].height, opacity: dropdowns[4].opacity, overflow: "hidden" }}>
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

            {/* Reminder */}
            <Spacer height={20} />
            <View style={[styles.inputStyle, { backgroundColor: theme.inputBackground, borderRadius: 20, flexDirection: 'row', justifyContent: "space-between" }]}>
              <ThemedText variant='subtitle'>Add a Reminder</ThemedText>
              <Switch value={reminder} onValueChange={setReminder} />
            </View>

          </ScrollView>

          <ThemedButton style={{ alignSelf: "center", width: "100%" }} onPress={createRoutine}>
            <ThemedText>Save</ThemedText>
          </ThemedButton>

        </ThemedView>
      </Modal>
    );
  };

  export default ActivityInputModal;

  const styles = StyleSheet.create({
    container: { flex: 1, marginTop: 10 },
    inputStyle: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, borderRadius: 20, padding: 10 },
    timeOfDaySelector: { borderRadius: 10, width: "30%", height: 30, alignItems: "center", justifyContent: "center" }
  });
