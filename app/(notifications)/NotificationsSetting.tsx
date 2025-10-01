import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native'
import { router } from 'expo-router'
import React, { useState } from 'react'


// 🎨 UI
import ThemedView from 'components/ThemedView'
import ThemedText from 'components/ThemedText'
import { ArrowBigLeft } from 'lucide-react-native'
import Spacer from 'components/Spacer'

import { useTheme } from 'components/ThemeContext'

import NotificationTimeSettingModal from "../../components/NotificationTimeSettingModal"



const NotificationsSetting = () => {

  const {theme, darkMode} = useTheme()

  const [notificationOff, setNotificationOff] = useState<boolean>(false)
  const [reminderOff, setReminderOff] = useState<boolean>(false)
  const [dailyReminderOff, setDailyReminderOff] = useState<boolean>(false)
  const [showNotificationTimeSettingModal, setShowNotificationTimeSettingModal] = useState<boolean>(false)
  const [currentNotificationLable, setCurrentNotificationLable] = useState<string>("Default Alert Time");

  const [alertTimes, setAlertTimes] = useState<{ [label: string]: string }>({
    "Default Alert Time": "08:00 AM",
    "Morning Routine Reminder": "07:00 AM",
    "Evening Routine Reminder": "07:00 PM",
  });


  const toggleNotification = () => {
    setNotificationOff(prev => !prev)
  }

  const toogleReminder = () => {
    setReminderOff(prev => !prev)
  }

  const toggleDailyReminder = () => {
    setDailyReminderOff(prev => !prev)
  }

  const getMinutesBefore = (time: string, minutesBefore: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes - minutesBefore, 0, 0); // subtract minutes
    let adjustedHours = date.getHours();
    let adjustedMinutes = date.getMinutes();
    const ampm = adjustedHours >= 12 ? "PM" : "AM";
    adjustedHours = adjustedHours % 12;
    if (adjustedHours === 0) adjustedHours = 12;

    return `${adjustedHours}:${String(adjustedMinutes).padStart(2, "0")} ${ampm}`;
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

      <ThemedText variant='title' style={{textAlign:"center"}}>Notification Setting</ThemedText>

      <Spacer height={25} />

      <View>
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
          <ThemedText variant='subtitle'>Notification</ThemedText>
          <Switch 
            value={notificationOff}
            onValueChange={toggleNotification}
          />
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
          <ThemedText variant='subtitle'>Reminders</ThemedText>
          <Switch 
            value={reminderOff}
            onValueChange={toogleReminder}
          />
        </View>

        <TouchableOpacity style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}
          onPress={() => {
            setCurrentNotificationLable("Default Alert Time");
            setShowNotificationTimeSettingModal(true)
          }}
        >
          <ThemedText variant='subtitle'>Default Alert Time</ThemedText>
          <ThemedText variant='smallertitle' style={{color: darkMode === "dark" ? theme.primary : "black"}}>10 min before: {getMinutesBefore(alertTimes["Default Alert Time"], 10)}</ThemedText>
        </TouchableOpacity>

        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}>
          <ThemedText variant='subtitle'>Daily Reminders</ThemedText>
          <Switch 
            value={dailyReminderOff}
            onValueChange={toggleDailyReminder}
          />
        </View>

        <TouchableOpacity style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}
          onPress={() => {
            setCurrentNotificationLable("Morning Routine Reminder")
            setShowNotificationTimeSettingModal(true)
          }}
        >
          <ThemedText variant='subtitle'>Morning Routine Reminder</ThemedText>
          <ThemedText variant='smallertitle' style={{color: darkMode === "dark" ? theme.primary : "black"}}>{alertTimes["Morning Routine Reminder"]}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth: 0.5, borderColor: theme.tabIconColor, padding: 15, borderRadius: 10, marginBottom: 10}}
          onPress={() => {
            setCurrentNotificationLable("Evening Routine Reminder")
            setShowNotificationTimeSettingModal(true)
          }}
        >
          <ThemedText variant='subtitle'>Evening Routine Reminder</ThemedText>
          <ThemedText variant='smallertitle' style={{color: darkMode === "dark" ? theme.primary : "black"}}>{alertTimes["Evening Routine Reminder"]}</ThemedText>
        </TouchableOpacity>

      </View>

      <NotificationTimeSettingModal 
        isVisible={showNotificationTimeSettingModal} 
        onClose={() => setShowNotificationTimeSettingModal(false)} 
        lable={currentNotificationLable}
        value={alertTimes[currentNotificationLable]}
        onTimeSelect={(time: any) => {
          setAlertTimes(prev => ({ ...prev, [currentNotificationLable]: time })); // update only that label
        }}
      />
    </ThemedView>
  )
}

export default NotificationsSetting

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})