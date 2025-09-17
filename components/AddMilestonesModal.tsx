import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import React from 'react'

//⚛️STATE MANAGEMENT
import { useTheme } from './ThemeContext'


//🎨UI
import ThemeView from "../components/ThemedView"
import ThemedButton from './ThemedButton'
import ThemedText from './ThemedText'
import { CalendarPlus, Milestone, NotebookPen } from 'lucide-react-native'

//🔤Type
type AddMilestoneModal = {
    isVisible: boolean,
    onClose: () => void
    onSelect?: (type: "Add Milestone" |"Add Weekly Objective" | "Add Note" ) => void
}

const AddMilestonesModal = ({isVisible, onClose, onSelect}: AddMilestoneModal) => {

    const {theme} = useTheme()

    return (
        <Modal visible={isVisible} onRequestClose={onClose} transparent animationType='slide'>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.container}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.touchStyle}
                            onPress={() => {
                                onClose()
                                onSelect?.("Add Milestone")
                            }}
                        >
                            <Milestone size={20}/>
                            <ThemedText>Add Milestone</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.touchStyle}
                            onPress={() => {
                                onClose()
                                onSelect?.("Add Weekly Objective")
                            }}
                        >
                            <CalendarPlus size={20}/>
                            <ThemedText>Add Weekly Objective</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.touchStyle}
                            onPress={() => {
                                onClose()
                                onSelect?.("Add Note")
                            }}
                        >
                            <NotebookPen size={20}/>
                            <ThemedText>Add Note</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default AddMilestonesModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:"flex-end",
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
        width: "70%",
        borderRadius: 10,
        padding: 10,
        flexDirection:"row",
        justifyContent: "flex-start",
        columnGap: 10,

        // iOS shadow
        shadowColor: "#77d1d2ff",           
        shadowOffset: { width: 0, height: 0 },  
        shadowOpacity: 0.5,           
        shadowRadius: 15.84,           

        // Android shadow
        elevation: 5,

    }
})