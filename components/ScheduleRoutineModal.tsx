import { Modal, StyleSheet, Text, View } from 'react-native'
import React from 'react'


type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ScheduleRoutineModal = ({isVisible, onClose} : ActivityInputModalProps) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <Text> Routine Modal</Text>
    </Modal>
  )
}

export default ScheduleRoutineModal

const styles = StyleSheet.create({})