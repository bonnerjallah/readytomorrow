// 🌱 ROOT IMPORTS
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'

// 🎨 UI
import {useTheme} from "../components/ThemeContext"
import ThemedText from './ThemedText'
import { useState } from 'react'

// 🔤 TYPES
type AddTaskModalProps = {
    isVisible: boolean,
    onClose: () => void
    onSelect?: (type: "activity" | "routine" | "ritual") => void
}




const AddTaskModal = ({isVisible, onClose, onSelect}: AddTaskModalProps) => {

    const {theme} = useTheme()

  return (
    <Modal 
        visible={isVisible}
        animationType = "slide"
        transparent
        onRequestClose={onClose}
    >

        <TouchableWithoutFeedback onPress={onClose}>
            <View style={[styles.container]}>
                <View style={styles.modalContent}>
                    <TouchableOpacity 
                        style={styles.touchStyle}
                        onPress={() => {
                            onClose();
                            onSelect?.("activity")
                        }}
                    >
                        <ThemedText>
                            📝 Add Activity
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.touchStyle}
                        onPress={() => {
                            onClose();
                            onSelect?.("routine")
                        }}
                    >
                        <ThemedText>
                            🕒 Schedule Routine                        
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.touchStyle}
                        onPress={() => {
                            onClose();
                            onSelect?.("ritual")
                        }}
                    >
                        <ThemedText>
                            🌅 Add Daily Ritual
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>

    </Modal>
  )
}

export default AddTaskModal

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "flex-end", 
        backgroundColor: "rgba(0, 0, 0, .90)",

    },
    modalContent: {
        paddingHorizontal: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        height: 600,
        borderColor: "white",
        rowGap: 45
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