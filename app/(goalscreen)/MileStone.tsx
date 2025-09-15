import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from 'components/ThemedView'



//⚛️ STATE MANAGEMENT
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom'


const MileStone = () => {

    const selectedGoal = useAtomValue(SelectedGoalAtom)

    console.log("selected goal", selectedGoal)


  return (
    <ThemedView style={styles.container} safe>
      <Text>MileStone</Text>
    </ThemedView>
  )
}

export default MileStone

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})