import { StyleSheet, Text, View, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { use, useEffect } from 'react'
import { useState } from 'react'

//🎨 UI
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import Spacer from './Spacer'
import CloseButton from './CloseButton'
import ThemedButton from './ThemedButton'
import ThemedTextInput from './ThemedTextInput'

//⚛️ STATE MANAGEMENT
import { useTheme } from './ThemeContext'
import { useAtomValue } from 'jotai'
import { selectedObjectiveIdAtom } from 'atoms/weeklyObjectiviesActivitiesAtom'




// 🔥 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, doc, limit, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'

// 🔤 TYPE
type Props = {
    isVisible: boolean;
    onClose: () => void;
}

const WeeklyObjectiveActivitiesInputModal = ({ isVisible, onClose }: Props) => {

    const { theme } = useTheme()

    const selectedObjective = useAtomValue(selectedObjectiveIdAtom)
    
    const [activity, setActivity] = useState("");

    const [displayActivities, setDisplayActivities] = useState<Array<{id: string; activityName: string; createdAt: Date}>>([])
    
    
    // Handle adding a new activity to the selected weekly objective
    const handleActivitySubmit = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || !selectedObjective) {
            console.log("No user is logged in or no objective selected.");
            return;
        }

        try {
            const trimActivity = activity.trim();

            const activitiesCol = collection(db, "users", userId, "weeklyObjectives", String(selectedObjective.id), "activities");
            const newActivityDoc = doc(activitiesCol); 
            await setDoc(newActivityDoc, {
                activityName: trimActivity,
                completed: false,
                createdAt: new Date()
            });
            setActivity("");

            onClose();
            
        } catch (error) {
            console.error("Error adding activity: ", error);
        }
    };


    // Fetch activities for the selected weekly objective
    useEffect(() => {
        if (!selectedObjective) return;
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const activitiesCol = collection(db, "users", userId, "weeklyObjectives", selectedObjective.id, "activities");
        const q = query(activitiesCol, orderBy("createdAt", "asc"), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    activityName: data.activityName ?? "",
                    createdAt: data.createdAt?.toDate?.() || new Date()
                };
            });
            setDisplayActivities(activitiesData);
        });

        return () => unsubscribe();
    }, [selectedObjective]);

  return (
    <Modal
        animationType='slide'
        transparent
        visible={isVisible}
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container} safe>
                <Spacer height={20} />
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <CloseButton onPress={onClose} />
                    <ThemedText variant='title'>Add Activities</ThemedText>
                    <ThemedButton style={{marginRight: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: "#77d1d2ff", width: 90, height: 30 }} onPress={handleActivitySubmit}>
                        <ThemedText style={{color: theme.buttontitle, justifyContent: "center", alignItems: "center"}}>Add</ThemedText>
                    </ThemedButton>
                </View>
                
                <Spacer height={25} />

                <ThemedText style={{textAlign: "center"}} variant='subtitleBold'>{selectedObjective?.activityName}</ThemedText>

                <Spacer height={20} />
                <ThemedTextInput 
                    placeholder=' Enter Activity'
                    multiline
                    style={{minHeight: 100, textAlignVertical: "top", backgroundColor: theme.background}}
                    value={activity}
                    onChangeText={setActivity}
                />

                <Spacer height={20} />

                <View style={{flex: 1, paddingHorizontal: 10, borderColor: theme.tabIconColor}}>
                    {displayActivities && displayActivities.map(elem => (
                        <View key={elem.id} style={{marginBottom: 10, backgroundColor: "#a2d2ff75", padding: 10, borderRadius: 10,}}>
                            <ThemedText style={{fontSize: 16}}>- {elem.activityName}</ThemedText>
                        </View>
                    ))}
                </View>
            
            </ThemedView>
        </TouchableWithoutFeedback>
    </Modal>
  )
}

export default WeeklyObjectiveActivitiesInputModal

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
})