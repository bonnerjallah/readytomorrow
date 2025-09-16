import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import ThemedText from '../components/ThemedText';
import { Clock, EllipsisVertical, RedoDot } from 'lucide-react-native';

import { useSetAtom } from 'jotai';
import { selectedItemTypeAtom } from '../atoms/selectedTaskAtom'; // adjust the path

interface TaskCardProps {
  elem: any; // Replace with ActivityType if you have one
  darkMode: string;
  theme: any;
  setSelectedTask?: (task: any) => void;
  setSelectedRoutine?: (task: any) => void; // optional
  setShowEditModal: (show: boolean) => void;
  handleTaskComplete: (id: string, done: boolean) => void;
  setShowRedoModal: (show: boolean) => void;
  backgroundColor?: string;
  textStyle?: object;
}

// 🔹 Color picker
const getPriorityColor = (priority: "Normal" | "High" | "Highest" = "Normal") => {
  switch (priority) {
    case "High":
      return "rgba(240, 173, 78, 0.3)";
    case "Highest":
      return "rgba(155, 89, 182, 0.3)";
    default:
      return "rgba(95, 173, 241, 0.3)";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  elem,
  darkMode,
  theme,
  backgroundColor,
  textStyle,
  setSelectedTask,
  setShowEditModal,
  handleTaskComplete,
  setShowRedoModal,
}) => {

  const setSelectedItemType = useSetAtom(selectedItemTypeAtom);
  
  const onEditPress = () => {
    setSelectedTask?.(elem);
    setSelectedItemType('task');
    setShowEditModal(true);
  };

    const onRedoPress = () => {
    setSelectedTask?.(elem);
    setShowRedoModal(true);
  };

  const onCompletePress = () => {
    handleTaskComplete(elem.id, !elem.done);
  };


  return (
    <View
      style={[
        styles.taskCard,
        {
          borderColor: darkMode === 'dark' ? '#495057' : 'black',
          backgroundColor: backgroundColor || getPriorityColor(elem.selectedPriority || 'Normal'),
        },
      ]}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginTop: 10 }}>
        {elem.selectedPriority && (
          <ThemedText variant="smallertitle">{elem.selectedPriority} Priority</ThemedText>
        )}
        <EllipsisVertical
          color={darkMode === 'dark' ? theme.primary : 'black'}
          onPress={onEditPress}
        />
      </View>

      {/* Body */}
      <View style={{ marginTop: 5 }}>
        <View style={{ flexDirection: 'row', columnGap: 5, alignItems: 'center', marginHorizontal: 10 }}>
          <TouchableOpacity
            style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              borderWidth: 0.5,
              borderColor: darkMode === 'dark' ? 'white' : 'black',
              backgroundColor: elem.done ? 'green' : 'transparent',
            }}
            onPress={onCompletePress}
          />
          <ThemedText variant="subtitleBold" style={[textStyle, { width: '90%' }]}>
            {elem.activity}
          </ThemedText>
        </View>

        <ThemedText style={[textStyle, { width: '90%', alignSelf: 'center', paddingTop: 5, paddingHorizontal: 10 }]} variant="smallertitle">
          {elem.note}
        </ThemedText>
      </View>

      {/* Footer */}
      <View style={[styles.taskCardBottom, { backgroundColor: darkMode === 'dark' ? '#495057' : '#e9ecef' }]}>

        {elem.isRecurring ? (
          <TouchableOpacity onPress={onRedoPress} style={{backgroundColor: theme.primary, borderRadius:10, padding: 5}}>
            <RedoDot size={15} stroke="yellow" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onRedoPress} >
            <RedoDot size={15}  />
          </TouchableOpacity>
        )}
        
        <View style={{ flexDirection: 'row', columnGap: 5 }}>
          <Clock size={15} stroke={darkMode === 'dark' ? theme.primary : 'black'} />
          <ThemedText variant="smallertitle">
            {elem.isAllDay ? 'All Day' : elem.selectedPart || 'Any Time'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  taskCard: {
    borderWidth: 0.4,
    borderRadius: 10,
    marginBottom: 15,
    minHeight: 60,

    backgroundColor: "hsla(225, 18%, 39%, 0.4)",
    
    // Android shadow
    elevation: 5,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  taskCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 10
  },
});
