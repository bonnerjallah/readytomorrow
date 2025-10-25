import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import Checkbox from 'expo-checkbox'
import { useState } from 'react'


//🎨 UI
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import Spacer from './Spacer'

//⚛️ STATE MANAGEMENT
import { useTheme } from '../components/ThemeContext'
import { useSetAtom } from 'jotai'
import { selectedObjectiveIdAtom } from 'atoms/weeklyObjectiviesActivitiesAtom'


// 🧩 COMPONENTS
import WeeklyObjectiveActivitiesInputModal from 'components/WeeklyObjectiveActivitiesInputModal'

// 🔤 TYPE
type weeklyObjectiveType = {
  id: string;
  objectiveName: string;
  createdAt?: Date;
  completed?: boolean; // ✅ add this
  icon?: any;
  getSatruday?: Date;
  activities?: ActivityType[];
  onObjectiveCompletion?: (objectiveId: string, isCompleted?: boolean) => void | Promise<void>;
  onActivityCompletion?: (activityId: string, isCompleted?: boolean) => void | Promise<void>;
};


type ActivityType = {
    id: string;
    activityName: string;
    createdAt: Date;
    checked?: boolean;
}

const WeeklyObjectiveCard = ({ id, objectiveName, icon, getSatruday, activities, completed, onActivityCompletion, onObjectiveCompletion }:weeklyObjectiveType) => {

    const { theme, darkMode } = useTheme()

    const setSelectedObjectiveId = useSetAtom(selectedObjectiveIdAtom)

    const [objectiveCompleted, setObjectiveCompleted] = useState(completed ?? false);
    const [activitiesState, setActivitiesState] = useState<ActivityType[]>(activities?.map(a => ({ ...a, checked: a.checked ?? false })) || []);    
    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {
        setActivitiesState(activities?.map(a => ({ ...a, checked: a.checked ?? false })) || []);
    }, [activities]);


    useEffect(() => {
        setObjectiveCompleted(completed ?? false);
    }, [completed]);




  return (
    <ThemedView style={[styles.cardWrapper, {borderColor: theme.tabIconColor, backgroundColor: darkMode === "dark" ? "#64dfdf20" : "#64dfdf10"}]}>
        <View style={{flexDirection: "row", alignItems:"center", justifyContent: "space-between", borderBottomWidth: 0.6, borderColor: theme.tabIconColor, paddingBottom: 10}}>
            <View style={{flexDirection: "row", alignItems:"center", width: "70%", columnGap: 10}}>

               <Checkbox 
                    value={objectiveCompleted}
                    onValueChange={() => {
                        const newValue = !objectiveCompleted;
                        setObjectiveCompleted(newValue); // update local UI immediately
                        onObjectiveCompletion?.(id, newValue); // update Firestore
                    }}
                    style={{ borderRadius: 7 }}
                 />
                <ThemedText>{objectiveName}</ThemedText>
            </View>

            <TouchableOpacity
                onPress={() => {
                    setSelectedObjectiveId({ id, activityName: objectiveName, createdAt: new Date() });
                    setModalVisible(true);
                }}
            >
                {icon ?? null}
            </TouchableOpacity>
        </View> 

        <Spacer height={10} />

        <View style={{width: "70%"}}>
            {activities && activities.length > 0 ? (
                <ThemedText variant='smallertitle'> {activitiesState.filter(act => act.checked).length}/{activitiesState.filter(act => !act.checked).length}</ThemedText>
            ) : (
                <ThemedText variant='smallertitle' style={{ fontStyle: "italic", color: theme.tabIconColor }}>
                0/0
                </ThemedText>
            )}
            <Spacer height={5} />
            {activitiesState.length > 0 ? (
                activitiesState.map(act => (
                    <TouchableOpacity
                        key={act.id}
                        onPress={() => {
                           {
                            Alert.alert("Mark activity as complete?", "", [
                                {
                                    text: "Cancel",
                                    style: "cancel"
                                },
                                {
                                    text: "OK",
                                    onPress: () => {
                                        {
                                            onActivityCompletion?.(act.id);
                                            setActivitiesState(prev =>
                                            prev.map(a =>
                                                a.id === act.id ? { ...a, checked: !a.checked } : a
                                            )
                                        );
                                    }}
                                }
                            ])}  
                        }}
                    >
                        <ThemedText style={{
                            textDecorationLine: act.checked ? "line-through" : objectiveCompleted ? "line-through" : "none",
                            fontSize: 14,
                            color: act.checked ? "gray" : theme.tabIconColor
                        }}>
                            - {act.activityName}
                        </ThemedText>
                    </TouchableOpacity>
                ))
                ) : (
                <ThemedText style={{ fontSize: 14, fontStyle: "italic", color: theme.tabIconColor }}>
                    No activities added yet.
                </ThemedText>
            )}

        </View>

        <Spacer height={20} />

        <ThemedText variant='subtitleBold' style={{position: "absolute", bottom: 10, right: 10}}>{getSatruday?.toDateString()}</ThemedText>

        <WeeklyObjectiveActivitiesInputModal isVisible={modalVisible} onClose={() => setModalVisible(false)} />

    </ThemedView>
  )
}

export default WeeklyObjectiveCard

const styles = StyleSheet.create({
    cardWrapper:{
        padding: 15, 
        borderWidth: 0.6, 
        borderRadius: 10, 
        marginBottom: 20, 
        width: "100%",

        backgroundColor: "hsla(225, 18%, 39%, 0.4)",
        // Android shadow
        elevation: 5,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 4, 
    }
})