// 🌱 ROOT IMPORTS
import { ChevronDown, ChevronRight, CircleX } from "lucide-react-native";
import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";


// 🎨 UI
import Spacer from './Spacer'
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Moon, Sun } from 'lucide-react-native'

// ⚛️ STATE MANAGEMENT
import { useTheme } from "./ThemeContext";

// 🔤 TYPES
type DisplayGoalsOptionModalProps = {
  isVisible: boolean;
  onClose: () => void;
  selectSortBy?: (type: "A-Z" | "Time" | "Date") => void
  selectGroupBy?: (type: "Days" | "Progress" | "No Grouping") => void
  selectIncludes?: (type: ("Recently Missed Activities" | "Skipped Routine")[] )=> void
};




const DisplayGoalsOptionModal = ({ isVisible, onClose, selectSortBy, selectGroupBy, selectIncludes }: DisplayGoalsOptionModalProps) => {

    const {theme, darkMode, setDarkmode} = useTheme()

    const darkModeBool = darkMode === "dark"

    const [selectedSort, setSelectedSort] = useState<"A-Z" | "Time" | "Date" | null>("Time");
    const [selectedGroupOption, setSelectedGroupOption] = useState<"Days" | "Goals" | "Progress" | "No Grouping" | null>("No Grouping")

    const sortOptions: ("A-Z" | "Time" | "Date")[] = ["A-Z", "Time", "Date"];
    const groupOptions: ("Days" | "Progress" | "No Grouping")[] = ["Days", "Progress", "No Grouping"]
    const includeOption: ("Recently Missed Activities" | "Skipped Routine")[]=["Recently Missed Activities", "Skipped Routine"]



    // 🔹 Array of two dropdowns. Each has its own open, height, and opacity.
    const [dropdowns, setDropdowns] = useState([
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
    ]);

    const dropdownHeights = [160, 220];

    // 🔹 Toogle function for dropdown
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

   


  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="slide">
      <ThemedView style={[{backgroundColor: theme.background }, styles.container]} safe>

            <Spacer height={20} />

            <View style={{flexDirection:"row", justifyContent:'space-evenly', alignItems:"center"}}>
                <TouchableOpacity
                    onPress={() => setDarkmode(darkModeBool ? "light" : "dark")}
                    style={{ padding: 10 }}
                >
                    {darkModeBool ? (
                        <Sun size={30} stroke="yellow" fill="yellow" />
                    ) : (
                        <Moon size={30} fill={darkModeBool ? "white" : "black"} />
                    )}
                </TouchableOpacity>            

                <ThemedText variant="title" title>Display Options</ThemedText>

            
                <CircleX  
                    onPress={onClose}
                    stroke="#34a0a4"
                    size={35}
                />
            </View>

            <Spacer height={55} />

            <ScrollView>

                <View style={styles.button}>
                    <TouchableOpacity  onPress={() => toggleDropDown(0)}>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <View>
                                <ThemedText>Sort by</ThemedText>
                                {selectedSort && (
                                    <Text>
                                        {selectedSort}
                                    </Text>
                                )}
                            </View>
                            {dropdowns[0].open ? (
                                <ChevronDown />
                            ) : (
                                <ChevronRight />
                            )}
                        </View>
                    </TouchableOpacity>

                    
                    <Animated.View
                        style={[
                            styles.dropdown,
                            { height: dropdowns[0].height, opacity: dropdowns[0].opacity, overflow: "hidden" }
                        ]}
                    >
                        {sortOptions.map((type) => (
                            <View 
                                key={type} 
                                style={{flexDirection:"row", alignItems:"center", columnGap: 10 , borderBottomWidth:0.2, paddingBottom: 10}}
                            >
                                <Checkbox
                                    value={selectedSort === type}
                                    onValueChange={() => {
                                        setSelectedSort(type);
                                        selectSortBy?.(type);
                                    }}
                                />
                                <ThemedText style={styles.item}>
                                    {type === "A-Z" ? "A-Z" : type === "Time" ? "Time" : "Date"}
                                </ThemedText>
                            </View>
                        ))}
                    </Animated.View>
                </View>

                <Spacer height={20} />

                <View style={styles.button}>
                    <TouchableOpacity  onPress={() => toggleDropDown(1)}>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <View>
                                <ThemedText>Sort by</ThemedText>
                                {selectedGroupOption && (
                                    <Text>
                                        {selectedGroupOption}
                                    </Text>
                                )}
                            </View>
                            {dropdowns[1].open ? (
                                <ChevronDown />
                            ) : (
                                <ChevronRight />
                            )}
                        </View>
                    </TouchableOpacity>

                    <Animated.View
                        style={[
                            styles.dropdown,
                            { height: dropdowns[1].height, opacity: dropdowns[1].opacity }
                        ]}
                    >
                        {groupOptions.map((type) => (
                            <View
                                key={type}
                                style={{flexDirection:"row", alignItems:"center", columnGap: 10 , borderBottomWidth:0.2, paddingBottom: 10}}
                            >
                                <Checkbox 
                                    value={selectedGroupOption === type}
                                    onValueChange={() => {
                                        setSelectedGroupOption(type)
                                        selectGroupBy?.(type)
                                    }}
                                />
                                <ThemedText style={styles.item}>
                                    {type === "Days" ? "Days" : type === "Progress" ? "Progress" : "No Grouping" }
                                </ThemedText>

                            </View>
                        ))}
                    </Animated.View>
                
                </View>

                <Spacer height={20} />

                

            </ScrollView>
      </ThemedView>
    </Modal>
  );
};

export default DisplayGoalsOptionModal;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    },

    button: {
        backgroundColor: "#77d1d2ff",
        width: "90%",
        borderRadius: 10,
        padding: 15,
        alignSelf:"center",
        justifyContent: "center",
        rowGap: 10,


        // iOS shadow
        shadowColor: "#77d1d2ff",           
        shadowOffset: { width: 0, height: 0 },  
        shadowOpacity: 0.5,           
        shadowRadius: 15.84,           

        // Android shadow
        elevation: 5,
    },

    dropdown: {
        backgroundColor: "#77d1d2ff",
        padding: 10,
        width: "90%",
        alignSelf:"center",
        rowGap: 7
    },
    item: {
        padding: 5, 
        fontSize: 16, 
        borderRadius: 10
        
    },
});
