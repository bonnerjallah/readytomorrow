import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';

// 🎨 UI
import ThemedView from 'components/ThemedView';
import ThemedText from 'components/ThemedText';
import { ArrowBigLeft } from 'lucide-react-native';
import Spacer from 'components/Spacer';
import { useTheme } from 'components/ThemeContext';
import NotificationTimeSettingModal from '../../components/NotificationTimeSettingModal';

import BackButton from 'components/BackButton';

import { useAtom } from 'jotai';
import { alertTimesAtom, dailyRemindersAtom, remindersAtom, notificationAtom } from 'atoms/notificationAtom';

const DEFAULT_ALERT_TIMES = {
  "Default Alert Time": "08:00 AM",
  "Morning Routine Reminder": "07:00 AM",
  "Evening Routine Reminder": "07:00 PM",
};

const NotificationsSetting = () => {
  const { theme, darkMode } = useTheme();

  const [notificationOff, setNotificationOff] = useAtom(notificationAtom);
  const [reminderOff, setReminderOff] = useAtom(remindersAtom);
  const [dailyReminderOff, setDailyReminderOff] = useAtom(dailyRemindersAtom);

  const [showNotificationTimeSettingModal, setShowNotificationTimeSettingModal] = useState(false);
  const [currentNotificationLabel, setCurrentNotificationLabel] = useState<keyof typeof DEFAULT_ALERT_TIMES>("Default Alert Time");

  const [alertTimes, setAlertTimes] = useAtom(alertTimesAtom);

  const toggleNotification = () => setNotificationOff(prev => !prev);
  const toggleReminder = () => setReminderOff(prev => !prev);
  const toggleDailyReminder = () => setDailyReminderOff(prev => !prev);

  // Safe function to subtract minutes
  const getMinutesBefore = (timeStr: string, minutesBefore: number) => {
    if (!timeStr) timeStr = "08:00 AM"; // fallback
    const [time, meridiem] = timeStr.split(" ");
    const [hourStr, minuteStr] = time.split(":");
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - minutesBefore);

    const resultHours = date.getHours();
    const resultMinutes = date.getMinutes();

    const ampm = resultHours >= 12 ? "PM" : "AM";
    const hour12 = resultHours % 12 === 0 ? 12 : resultHours % 12;
    const minuteStrPadded = String(resultMinutes).padStart(2, "0");

    return `${hour12}:${minuteStrPadded} ${ampm}`;
  };

  const renderNotificationRow = (label: keyof typeof DEFAULT_ALERT_TIMES) => (
    <TouchableOpacity
      key={label}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: theme.tabIconColor,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
      }}
      onPress={() => {
        setCurrentNotificationLabel(label);
        setShowNotificationTimeSettingModal(true);
      }}
    >
      <ThemedText variant="subtitle">{label}</ThemedText>
      <ThemedText
        variant="smallertitle"
        style={{ color: darkMode === 'dark' ? theme.primary : 'black' }}
      >
        {getMinutesBefore(alertTimes?.[label] ?? DEFAULT_ALERT_TIMES[label], 10)}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container} safe>
      

      <BackButton />

      <Spacer height={20} />

      <ThemedText variant="title" style={{ textAlign: 'center' }}>
        Notification Setting
      </ThemedText>

      <Spacer height={25} />

      <View>
        {/* Notification Switches */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 0.5,
            borderColor: theme.tabIconColor,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <ThemedText variant="subtitle">Notification</ThemedText>
          <Switch value={notificationOff} onValueChange={toggleNotification} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 0.5,
            borderColor: theme.tabIconColor,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <ThemedText variant="subtitle">Reminders</ThemedText>
          <Switch value={reminderOff} onValueChange={toggleReminder} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 0.5,
            borderColor: theme.tabIconColor,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <ThemedText variant="subtitle">Daily Reminders</ThemedText>
          <Switch value={dailyReminderOff} onValueChange={toggleDailyReminder} />
        </View>

        {/* Notification Times */}
        {Object.keys(DEFAULT_ALERT_TIMES).map((key) =>
          renderNotificationRow(key as keyof typeof DEFAULT_ALERT_TIMES)
        )}
      </View>

      {/* Modal */}
      <NotificationTimeSettingModal
        isVisible={showNotificationTimeSettingModal}
        onClose={() => setShowNotificationTimeSettingModal(false)}
        label={currentNotificationLabel}
        value={alertTimes?.[currentNotificationLabel] ?? DEFAULT_ALERT_TIMES[currentNotificationLabel]}
        defaultTime={
          alertTimes?.[currentNotificationLabel] ??
          DEFAULT_ALERT_TIMES[currentNotificationLabel]
        }
        onTimeSelect={(time: string) => {
          setAlertTimes(prev => ({ ...(prev ?? {}), [currentNotificationLabel]: time }));
        }}
      />
    </ThemedView>
  );
};

export default NotificationsSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
