//🌱 ROOT IMPORTS
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { ReactNode, useRef, useState } from 'react'
import { router } from 'expo-router'
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';



// ⚛️STATE MANAGEMENT
import { useSetAtom } from 'jotai';
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom';
import { useTheme } from './ThemeContext';


//🎨 COMPONENT
import ThemedText from './ThemedText'
import ThemedView from './ThemedView';
import ProgressBar from './ProgressBar';

//🔥FIREBASE
import { Timestamp } from 'firebase/firestore';



// 🔤 TYPE
type GoalsCardProps = {
    elem: any,        
    allMilestoneData?: MilestoneDataType[];
    mileStoneCompleted?: MilestoneDataType[];
    allObjectivesData?: goalObjectiveType[];
    objectiveCompleted?: goalObjectiveType[];
    goalId?: string;
    milestoneData?: MilestoneDataType[];
    allgoalObjectives?: goalObjectiveType[];
};

type MilestoneDataType = {
    id: string;
    mileStoneName: string;
    mileStoneNote: string;
    targetDate: string;
    completed: boolean;
    createdAt: Timestamp | null;
    goalId?: string;
}

type goalObjectiveType = {
    id: string;
    objectiveName: string;
    objectiveNote: string;
    targetDate: string;
    completed: boolean;
    createdAt: Timestamp | null;
    goalId?: string;
}

const GoalsCard = ({elem, allMilestoneData, allObjectivesData, objectiveCompleted }: GoalsCardProps) => {

    const {theme, darkMode} = useTheme()

    const setSelectedAtom = useSetAtom(SelectedGoalAtom)

    const [loadingImage, setLoadingImages] = useState<{[key: string] : boolean}>()

    //🔹Image source
    const imageSource  = (image: string | number | null | undefined) => {
        if (!image) return require("../assets/images/manwriting.png");

        return typeof image === "number" ? image : { uri: image };
    };

    const milestonesForThisGoal = allMilestoneData?.filter(m => m.goalId === elem.id) ?? [];
    const completedForThisGoal = milestonesForThisGoal.filter(m => m.completed);

    const goalObjectiveForThisGoal = allObjectivesData?.filter(o => o.goalId === elem.id) ?? [];
    const completedObjectivesForThisGoal = goalObjectiveForThisGoal.filter(o => o.completed);

    
  return (
        
    <View style={{marginVertical: 10, width: "100%"}}>
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
                            source={imageSource(elem.categoryImage)}
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

                    <TouchableOpacity
                        onPress={() => {
                            setSelectedAtom(elem)
                            router.push("(goalscreen)/EditDeleteGoals")}
                        }
                        style={{zIndex: 3}}
                    >
                        <EllipsisVertical stroke={theme.tabIconColor} />
                    </TouchableOpacity>
                    
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <View style={{flexDirection:"row", columnGap: 20}}>
                        <View style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                        <Milestone size={20} stroke={theme.tabIconColor}/>
                            <ThemedText variant='smallertitle'>{completedForThisGoal?.length ?? 0}/{milestonesForThisGoal?.length ?? 0}</ThemedText>
                        </View>
                        <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                            <Activity size={20} stroke={theme.tabIconColor} />
                            <ThemedText variant='smallertitle'>{completedObjectivesForThisGoal?.length ?? 0}/{goalObjectiveForThisGoal?.length ?? 0}</ThemedText>
                        </View>
                    </View>
                    <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                        <Calendar size={20} stroke={theme.tabIconColor} />
                        <View>
                            <ThemedText variant='smallertitle'>{elem.targetDateFormatted}</ThemedText>
                        </View>
                    </View>
                </View>

                <ProgressBar width={280} height={5} progress={milestonesForThisGoal.length === 0 ? 0 : (completedForThisGoal.length / milestonesForThisGoal.length)} />

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
    </View>

    
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