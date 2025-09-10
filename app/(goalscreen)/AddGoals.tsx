import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search, SearchIcon, ArrowBigLeft } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'
import { CirclePlus } from 'lucide-react-native'

type Props = {}

const AddGoals = (props: Props) => {
  return (
    <ThemedView style={styles.container} safe>
        <View style={{flexDirection:'row', }}>
            <TouchableOpacity>
                <ArrowBigLeft />
            </TouchableOpacity>
            <ThemedText variant='title'>Select Goal Category</ThemedText>
        </View>
        <Spacer height={20} />
      <ScrollView>
            
      </ScrollView>
    </ThemedView>
  )
}

export default AddGoals

const styles = StyleSheet.create({
    container:{
        flex: 1
    }
})