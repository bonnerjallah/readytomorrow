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
} from "react-native";
import ThemedView from "./ThemedView";

// 🎨 UI
import Spacer from '../components/Spacer'
import ThemedText from "./ThemedText";
import { Moon, Sun } from 'lucide-react-native'

// ⚛️ STATE MANAGEMENT
import { useTheme } from "./ThemeContext";

// 🔤 TYPES
type DisplayOptionsModalProps = {
  isVisible: boolean;
  onClose: () => void;
  selectSortBy: (type: "alpha" | "time" | "date") => void
};




const DisplayOptionsModal = ({ isVisible, onClose }: DisplayOptionsModalProps) => {

    const {theme, darkMode, setDarkmode} = useTheme()

    const darkModeBool = darkMode === "dark"

    // 🔹 Array of two dropdowns. Each has its own open, height, and opacity.
    const [dropdowns, setDropdowns] = useState([
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
        { open: false, height: new Animated.Value(0), opacity: new Animated.Value(0) },
    ]);

    // 🔹 Toogle function for dropdown
    const toggleDropDown = (index: number) => {
        const current = dropdowns[index];
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
            Animated.spring(current.height, { toValue: 120, stiffness: 120, damping: 15, mass: 1, useNativeDriver: false }),
            Animated.timing(current.opacity, { toValue: 1, duration: 150, useNativeDriver: false }),
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


        <View style={styles.button}>
            <TouchableOpacity  onPress={() => toggleDropDown(0)}>
                <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                    <ThemedText>Sort by</ThemedText>
                    {dropdowns[0].open ? (
                        <ChevronDown />
                    ) : (
                        <ChevronRight />
                    )}
                </View>
            </TouchableOpacity>
            {dropdowns[0].open && (
                <Animated.View
                    style={[
                        styles.dropdown,
                        { height: dropdowns[0].height, opacity: dropdowns[0].opacity }
                    ]}
                >
                     {/* <TouchableOpacity onPress={() => selectSortBy?.("alpha")}>
                        <Text style={[styles.item, { backgroundColor: theme.dropdownBackground }]}>
                        Option 1
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectSortBy?.("time")}>
                        <Text style={[styles.item, { backgroundColor: theme.dropdownBackground }]}>
                        Option 2
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectSortBy?.("date")}>
                        <Text style={[styles.item, { backgroundColor: theme.dropdownBackground }]}>
                        Option 3
                        </Text>
                    </TouchableOpacity> */}
                </Animated.View>
            )}
        </View>

        <Spacer height={20} />

        <View style={styles.button}>
            <TouchableOpacity  onPress={() => toggleDropDown(1)}>
                <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                    <ThemedText>Sort by</ThemedText>
                    {dropdowns[0].open ? (
                        <ChevronDown />
                    ) : (
                        <ChevronRight />
                    )}
                </View>
            </TouchableOpacity>
            {dropdowns[1].open && (
                <Animated.View
                    style={[
                        styles.dropdown,
                        { height: dropdowns[1].height, opacity: dropdowns[1].opacity }
                    ]}
                >
                    <Text style={[styles.item, {backgroundColor: theme.dropdownBackground}]}>Option 1</Text>
                    <Text style={[styles.item, {backgroundColor: theme.dropdownBackground}]}>Option 2</Text>
                    <Text style={[styles.item, {backgroundColor: theme.dropdownBackground}]}>Option 3</Text>
                </Animated.View>
            )}
        </View>


      </ThemedView>
    </Modal>
  );
};

export default DisplayOptionsModal;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    },

    button: {
        backgroundColor: "#77d1d2ff",
        width: "90%",
        borderRadius: 10,
        padding: 10,
        alignSelf:"center",
        justifyContent: "center",


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
        borderRadius: 10,
        overflow: "hidden",
        padding: 10,
        marginTop: 10,
        width: "90%",
        alignSelf:"center"
    },
    item: {
        padding: 5, 
        fontSize: 16, 
        marginTop: 5,
        borderRadius: 10
        
    },
});
