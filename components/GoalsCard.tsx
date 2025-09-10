import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import ThemedText from './ThemedText'
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import Spacer from './Spacer'


type Props = {}

const GoalsCard = (props: Props) => {
  return (
    <View style={{borderWidth:1 , borderRadius: 10, width: "95%", rowGap: 25, padding: 10, alignSelf:"center"}}>
        <View style={{flexDirection:"row", justifyContent:"space-between", columnGap: 5}}>
            <View style={{width: "20%", borderWidth: 1}}>
                <ThemedText>image goes here</ThemedText>
            </View>
            <View style={{borderWidth: 1, width:"70%"}}>
                <ThemedText>
                    goals here
                </ThemedText>
            </View>
            <EllipsisVertical />
        </View>
        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
           <View style={{flexDirection:"row", columnGap: 20}}>
                <View style={{flexDirection:"row"}}>
                    <Milestone size={20}/>
                </View>
                <View  style={{flexDirection:"row"}}>
                    <Activity size={20} />
                </View>
            </View>
            <View  style={{flexDirection:"row"}}>
                <Calendar size={20} />
            </View>
        </View>
        <>
            <ThemedText>Traker bar</ThemedText>
        </>
      
    </View>
  )
}

export default GoalsCard

const styles = StyleSheet.create({})