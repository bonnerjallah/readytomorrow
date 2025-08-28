import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from "react-native";

import { useTheme } from "./ThemeContext";
import ThemedText from "./ThemedText";

// Props interface
interface CustomWheelPickerProps {
  onValueChange?: (days: number, hours: number, minutes: number) => void;
  onUnset?: () => void; 
  days?: number,
  hours?: number,
  minutes?: number

}

// Constants
const ITEM_HEIGHT = 25;
const VISIBLE_ITEMS = 5;

const daysArray = Array.from({ length: 7 }, (_, i) => i );
const hoursArray = Array.from({ length: 24 }, (_, i) => i);
const minutesArray = Array.from({ length: 60 }, (_, i) => i);

export default function CustomWheelPicker({ onValueChange, onUnset }: CustomWheelPickerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const {theme} = useTheme()

  const scrollRefs = {
    day: useRef<ScrollView | null>(null),
    hour: useRef<ScrollView | null>(null),
    minute: useRef<ScrollView | null>(null),
  };

  // Notify parent on initial mount
  useEffect(() => {
    onValueChange?.(selectedDay, selectedHour, selectedMinute);
  }, []);

  // Handle snapping & update parent
  const handleSnap = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    dataArray: number[],
    setSelected: React.Dispatch<React.SetStateAction<number>>,
    ref: React.RefObject<ScrollView | null>,
    type: "day" | "hour" | "minute"
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const value = dataArray[index];
    setSelected(value);

    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });

    if (onValueChange) {
      const newDays = type === "day" ? value : selectedDay;
      const newHours = type === "hour" ? value : selectedHour;
      const newMinutes = type === "minute" ? value : selectedMinute;
      onValueChange(newDays, newHours, newMinutes);
    }
  };

  const renderWheel = (
    dataArray: number[],
    selected: number,
    setSelected: React.Dispatch<React.SetStateAction<number>>,
    ref: React.RefObject<ScrollView | null>,
    type: "day" | "hour" | "minute"
  ) => (
    <ScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={(e) => handleSnap(e, dataArray, setSelected, ref, type)}
      contentContainerStyle={{
        paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
      }}
      style={styles.wheel}
    >
      {dataArray.map((item) => {
        const isSelected = selected === item;
        return (
          <Pressable
            key={item}
            onPress={() => {
              setSelected(item);
              ref.current?.scrollTo({ y: dataArray.indexOf(item) * ITEM_HEIGHT, animated: true });
              // Notify parent immediately
              if (onValueChange) {
                const newDays = type === "day" ? item : selectedDay;
                const newHours = type === "hour" ? item : selectedHour;
                const newMinutes = type === "minute" ? item : selectedMinute;
                onValueChange(newDays, newHours, newMinutes);
              }
            }}
            style={[styles.item, isSelected && styles.selectedItem]}
          >
            <Text style={{ color: isSelected ? "white" : "black", fontSize: 20 }}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
        <View style={styles.pickerContainer}>
            {renderWheel(daysArray, selectedDay, setSelectedDay, scrollRefs.day, "day")}
            <Text style={[styles.label, {color: theme.text}]}>Days</Text>
        </View>
        <View style={styles.pickerContainer}>
            {renderWheel(hoursArray, selectedHour, setSelectedHour, scrollRefs.hour, "hour")}
            <Text style={[styles.label, {color: theme.text}]}>Hours</Text>
        </View>
        <View style={styles.pickerContainer}>
            {renderWheel(minutesArray, selectedMinute, setSelectedMinute, scrollRefs.minute, "minute")}
            <Text style={[styles.label, {color: theme.text}]}>Minutes</Text>
        </View>
        <ThemedText style={[styles.unsetBttn,{backgroundColor:theme.primary, color: theme.buttontitle}]} variant='smallertitle' onPress={onUnset}>
            Unset
        </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  pickerContainer: {
    alignItems: "center",
    flexDirection: "row",
    columnGap: 5,
  },
  wheel: {
    width: 60,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#34a0a4",
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
  },

  unsetBttn:{
    padding: 5, 
    borderRadius:10,
    height: 30,
    position: "absolute",
    bottom: 5,
    right: 5
  }
});
