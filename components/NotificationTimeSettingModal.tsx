import { StyleSheet, Text, View, Modal, Platform, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from './ThemeContext';
import ThemedText from '../components/ThemedText';

type NotificationTypeProps = {
  isVisible: boolean;
  onClose: () => void;
  label: string;
  value?: string;
  onTimeSelect: (time: string) => void;
  defaultTime: string
};

const NotificationTimeSettingModal = ({
  isVisible,
  onClose,
  label,
  onTimeSelect,
  defaultTime
}: NotificationTypeProps) => {
  const { theme, darkMode } = useTheme();

  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(Platform.OS === 'ios');

  const handleTimeChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
      if (Platform.OS === 'android') {
        // Android closes picker automatically
        setShowPicker(false);
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        onTimeSelect(`${hour12}:${minutes} ${ampm}`);
        onClose();
      }
    }
  };

  // Converts a string like "08:00 AM" into a Date object
const parseTimeString = (timeStr: string): Date => {
  const [time, meridiem] = timeStr.split(" "); // e.g., ["08:00", "AM"]
  const [hourStr, minuteStr] = time.split(":"); 
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};


  return (
    <Modal visible={isVisible} animationType='slide' transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: darkMode ? theme.primary : '#fff' }]}>
          {defaultTime && (
            <TouchableOpacity
              onPress={() => {
                const defaultDate = parseTimeString(defaultTime);
                setSelectedTime(defaultDate);
                onTimeSelect(defaultTime); // update parent state
              }}
              style={{
                marginTop: 10,
                padding: 12,
                backgroundColor: "#ccc",
                borderRadius: 8,
              }}
            >
              <ThemedText>Reset to Default</ThemedText>
            </TouchableOpacity>
          )}

          {/* iOS always shows spinner */}
          {Platform.OS === 'ios' && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              is24Hour={false}
              textColor={darkMode ? 'white' : 'black'}
              onChange={handleTimeChange}
              style={{ width: 200 }}
            />
          )}

          {/* Android shows button to open native picker */}
          {Platform.OS === 'android' && !showPicker && (
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{ padding: 12, backgroundColor: darkMode ? '#333' : '#eee', borderRadius: 8, marginTop: 10 }}
            >
              <ThemedText>
                {`${selectedTime.getHours() % 12 || 12}:${String(selectedTime.getMinutes()).padStart(2, '0')} ${selectedTime.getHours() >= 12 ? 'PM' : 'AM'}`}
              </ThemedText>
            </TouchableOpacity>
          )}

          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="clock"
              is24Hour={false}
              onChange={handleTimeChange}
            />
          )}

          <TouchableOpacity
            onPress={() => {
              const hours = selectedTime.getHours();
              const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const hour12 = hours % 12 === 0 ? 12 : hours % 12;
              onTimeSelect(`${hour12}:${minutes} ${ampm}`);
              onClose();
            }}
            style={{ marginTop: 20, padding: 12,  borderRadius: 8 }}
          >
            <ThemedText>Done</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationTimeSettingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 250,
  },
});
