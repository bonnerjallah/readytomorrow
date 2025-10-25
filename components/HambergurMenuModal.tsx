// 🌱 ROOT IMPORTS
import { ReactNode } from 'react'
import { StyleSheet, Text, View, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'

// 🔤 TYPES
type HambergurMenuModalProps = {
    isVisible: boolean,
    onClose : () => void,
}

// 🎨 UI
import ThemedView from "../components/ThemedView"
import ThemedText from "../components/ThemedText"
import Spacer from "../components/Spacer"
import { router } from 'expo-router'


const HambergurMenuModal = ({isVisible, onClose} : HambergurMenuModalProps) => {
  return (
    <Modal
        transparent
        visible={isVisible}
        onRequestClose={onClose}
        animationType='slide'
    >
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.container}>
                <View style={styles.modalContent}>
                     <TouchableOpacity style={styles.touchStyle}>
                        <ThemedText>
                            🗓️ Calender
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchStyle}>
                        <ThemedText>
                            🔁 Routine                      
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchStyle}
                        onPress={() => {
                            router.push('/PlanMyWeek')
                            onClose()
                        }}
                    >
                        <ThemedText>
                            🗒️ Plan My Week
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </Modal>

  )
}

export default HambergurMenuModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", 
        backgroundColor: "rgba(0, 0, 0, .90)",
    },
    modalContent: {
        paddingHorizontal: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        height: 500,
        borderColor: "white",
        rowGap: 45,
        position: "absolute",
        top: 125

    },
    touchStyle:{
        backgroundColor: "#77d1d2ff",
        width: "60%",
        borderRadius: 10,
        padding: 10,

         // iOS shadow
        shadowColor: "#77d1d2ff",           
        shadowOffset: { width: 0, height: 0 },  
        shadowOpacity: 0.5,           
        shadowRadius: 15.84,           

        // Android shadow
        elevation: 5,

    }
})