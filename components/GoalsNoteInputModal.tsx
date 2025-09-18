import { StyleSheet, Text, View, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'

//🎨UI
import ThemedText from './ThemedText'
import Spacer from './Spacer'
import ThemedView from './ThemedView'
import { CircleX } from 'lucide-react-native'
import ThemedTextInput from './ThemedTextInput'
import ThemedButton from './ThemedButton'

//⚛️STATE MANAGEMENT
import { useTheme } from './ThemeContext'
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom'

//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, addDoc, serverTimestamp, Timestamp} from 'firebase/firestore'

//🔤 TYPES
type GoalsNoteInputModalType = {
    isVisible: boolean,
    onClose: () => void
}

const GoalsNoteInputModal = ({isVisible, onClose}: GoalsNoteInputModalType) => {

    const {theme} = useTheme()

    const selectedGoal = useAtomValue(SelectedGoalAtom)

    const [goalNote, setGoalNote] = useState("")

    const handleNoteSubmit = async () => {
        const userId = auth.currentUser?.uid
        if(!userId || !selectedGoal?.id) return

        try {
            const noteCol = collection(db, "users", userId, "goals", selectedGoal.id, "goalNotes" )

            await addDoc(noteCol, {
                goalNote,
                createdAt: serverTimestamp()
            })

            setGoalNote("")

            onClose()
            
        } catch (error) {
            console.log("Error submiting note", error)
        }
    }


  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType='slide'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView style={styles.container} safe>
            <Spacer height={20} />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
                <ThemedText style={{ textAlign: "center", width: "83%" }} variant='title'>Add Note</ThemedText>
            </View>

            <Spacer height={30} />

            <ThemedTextInput
                placeholder='Add Note'
                multiline
                numberOfLines={5}
                textAlignVertical='top'
                style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                height: 200
                }}
                value={goalNote}
                onChangeText={setGoalNote}
            />

            <ThemedButton style={styles.buttonStyle} onPress={handleNoteSubmit}>
                <ThemedText style={{color: theme.buttontitle}} variant='button'>Save</ThemedText>
            </ThemedButton>

            </ThemedView>
        </TouchableWithoutFeedback>
    </Modal>

  )
}

export default GoalsNoteInputModal

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonStyle:{
        position:"absolute",
        bottom: 50, 
        alignSelf: "center",
        width: "90%"
    },
})