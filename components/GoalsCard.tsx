//🌱 ROOT IMPORTS
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { ReactNode, useRef, useState } from 'react'
import { router } from 'expo-router'
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';



// ⚛️STATE MANAGEMENT
import { useSetAtom } from 'jotai';
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom';


//🎨 COMPONENT
import ThemedText from './ThemedText'
import ThemedView from './ThemedView';



// 🔤 TYPE
type GoalsCardProps = {
  elem: any;         
  darkMode: string
  theme: any;   
};

const GoalsCard: React.FC<GoalsCardProps> = ({elem, darkMode, theme}) => {

    const setSelectedAtom = useSetAtom(SelectedGoalAtom)


    const [loadingImage, setLoadingImages] = useState<{[key: string] : boolean}>()



  return (
    <GestureHandlerRootView>

        

        <ThemedView style={{marginVertical: 10}}>
            <Pressable
                onPress={() => {
                    setSelectedAtom(elem)
                    router.push("(goalscreen)/MileStone")
                }}
            >
                <View style={[styles.cardWrapper,{borderRadius: 10, borderColor: darkMode === "dark" ? theme.tabIconColor: "black", width: "95%", rowGap: 5, borderWidth: 0.4, alignSelf:"center", backgroundColor: darkMode === "dark" ? "#184e77" : "hsla(208, 97%, 86%, 0.4)"}]}>
                    <View style={{flexDirection:"row", justifyContent:"space-between", borderBottomWidth: 0.5, paddingBottom: 5,  borderColor: theme.tabIconColor}}>
                        <View style={{width: "10%"}}>
                            <Image 
                                source={elem.categoryImage ? elem.categoryImage : require("../assets/images/manwriting.png")}
                                style={{width:"100%", height: undefined, aspectRatio: 1, resizeMode:"contain", borderRadius: 10}}

                                onLoadStart={() => {
                                    const key = typeof elem.categoryImage === "string" ? elem.categoryImage : "fallback";
                                    setLoadingImages(prev => ({ ...prev, [key]: true }));
                                }}
                                onLoadEnd={() => {
                                    const key = typeof elem.categoryImage === "string" ? elem.categoryImage : "fallback";
                                    setLoadingImages(prev => ({ ...prev, [key]: false }));
                                }}
                                

                            />

                            {loadingImage?.[elem.id] && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.primary}
                                    style={{
                                        position: "absolute",
                                        top: "40%",
                                        alignSelf: "center"
                                    }}
                                />
                            )}
                        </View>
                        <View style={{ width:"80%", justifyContent:"center", marginLeft: 10}} >
                            <ThemedText variant='subtitle'>
                                {elem.goalName}
                            </ThemedText>
                        </View>
                        <EllipsisVertical stroke={theme.tabIconColor} />
                    </View>
                    <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                        <View style={{flexDirection:"row", columnGap: 20}}>
                            <View style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                                <Milestone size={20} stroke={theme.tabIconColor}/>
                                <ThemedText variant='smallertitle'>0/5</ThemedText>
                            </View>
                            <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                                <Activity size={20} stroke={theme.tabIconColor} />
                                <ThemedText variant='smallertitle'>0/5</ThemedText>
                            </View>
                        </View>
                        <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                            <Calendar size={20} stroke={theme.tabIconColor} />
                            <View>
                                <ThemedText variant='smallertitle'>{elem.targetDateFormatted}</ThemedText>
                            </View>
                        </View>
                    </View>

                    
                    <ThemedText>Traker bar</ThemedText>

                    <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                        <View style={{justifyContent:"center", alignItems:"center"}}>
                            <ThemedText variant='subtitleBold'  style={{fontSize: 15, fontWeight: "bold", color: theme.tabIconColor}}>Category:</ThemedText>
                            <ThemedText variant='smallertitle' style={{fontSize:10}}>{elem.category}</ThemedText>
                        </View>
                        <View style={{justifyContent:"center", alignItems:"center"}}>
                            <ThemedText variant='subtitleBold'  style={{fontSize: 15, fontWeight: "bold", color: theme.tabIconColor}}>Priority:</ThemedText>
                            <ThemedText variant='smallertitle' style={{fontSize:10}}>{elem.selectedPriority}</ThemedText>
                        </View>
                    </View>
                    
                </View>
            </Pressable>
        </ThemedView>

        
    </GestureHandlerRootView>
    
  )
}

export default GoalsCard

const styles = StyleSheet.create({
    cardWrapper:{
        backgroundColor: "hsla(225, 18%, 39%, 0.4)",
        borderRadius: 10,
        padding: 10,
        
        // Android shadow
        elevation: 5,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 4,   
    }
})