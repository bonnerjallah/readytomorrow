import { StyleSheet, Text, View, Modal, Platform, TouchableWithoutFeedback, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from "@react-native-community/datetimepicker";


// 🎨 UI
import ThemedView from "../components/ThemedView"
import ThemedText from '../components/ThemedText'

import CustomWheelPicker from './CustomePicker'

import { useTheme } from './ThemeContext';

type NotificationTypeProps = {
  isVisible: boolean;
  onClose: () => void;
  lable: string;
  value: string;
  onTimeSelect: (time: any) => void;
}


const NotificationTimeSettingModal = ({isVisible, onClose, lable, onTimeSelect}: NotificationTypeProps) => {

    const {theme, darkMode} = useTheme()

    const [selectedTime, setSelectedTime] = useState<string>("")

    console.log("lable", lable)

  return (
    <Modal
        visible={isVisible}
        animationType='slide'
        transparent
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback 
            onPress={() => {
                onTimeSelect(selectedTime); 
                onClose()
            }} 
        >
            <View style={styles.overlay}>

                <View >
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <DateTimePicker
                        value={selectedTime ? (() => {
                            const [hours, minutes] = selectedTime.split(":").map(Number);
                            const d = new Date();
                            d.setHours(hours, minutes, 0, 0);
                            return d;
                        })() : new Date()}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        is24Hour={true}
                        textColor={darkMode === "dark" ? "white" : "black"}
                        onChange={(_event, date) => {
                            if (_event.type === "set" && date) {
                                let hours = date.getHours();
                                const minutes = String(date.getMinutes()).padStart(2, "0");
                                const ampm = hours >= 12 ? "PM" : "AM";
                                hours = hours % 12;
                                if (hours === 0) hours = 12; // convert 0 to 12 for 12 AM/PM
                                setSelectedTime(`${hours}:${minutes} ${ampm}`);
                            }
                        }}
                        style={{
                            backgroundColor: darkMode === "dark" ? theme.primary : "white",
                            borderRadius: 10,
                            width: 150, // optional: give it a fixed width
                        }}
                        />
                    </View>
                </View>

            </View>
        </TouchableWithoutFeedback>

    </Modal>
  )
}

export default NotificationTimeSettingModal

const styles = StyleSheet.create({
    container:{
        backgroundColor:"blue"
    },
    overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
    
})