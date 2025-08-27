import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'


type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ShowDailyRitualModal = ({isVisible, onClose}: ActivityInputModalProps) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
        <Text>Daily Ritual Modal</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
    </Modal>
  )
}

export default ShowDailyRitualModal

const styles = StyleSheet.create({})