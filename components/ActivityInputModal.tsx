import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'





type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ActivityInputModal = ({ isVisible, onClose }: ActivityInputModalProps) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
                <Text>Enter your activity</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
  </Modal>
  )
}

export default ActivityInputModal

const styles = StyleSheet.create({})