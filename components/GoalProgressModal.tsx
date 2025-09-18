import { StyleSheet, Text, View, Modal } from 'react-native'
import React, { useEffect } from 'react'

//🎨
import ThemedView from './ThemedView'
import ThemedText from './ThemedText'
import Spacer from './Spacer'
import { CircleX } from 'lucide-react-native'
import ProgressBar from "./ProgressBar"

//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, getDocs, onSnapshot, Timestamp } from 'firebase/firestore'

//⚛️STATE MAMAGEMENT
import { useAtomValue } from 'jotai'
import { GoalsAtom } from '../atoms/GoalCategoryAtom'

//🔤TYPES
type GoalsProgressModalType  ={
    onClose: () => void,
    isVisible: boolean
}

const GoalProgressModal = ({isVisible, onClose}: GoalsProgressModalType) => {

    const allGoals = useAtomValue(GoalsAtom)


  return (
    <Modal transparent animationType='slide' visible={isVisible}>
        <ThemedView style={styles.container} safe>
            <Spacer height={20} />

            <View style={{flexDirection:"row", alignItems:"center", columnGap:50, }}>
                <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
                <ThemedText variant='heading' style={{marginLeft: 45}}>Progress</ThemedText>
            </View>



        </ThemedView>


    </Modal>
  )
}

export default GoalProgressModal

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})