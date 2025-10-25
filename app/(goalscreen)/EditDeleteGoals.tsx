//🌱 ROOT IMPORTS
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import { Alert, StyleSheet, Text, TouchableOpacity, View,  ActivityIndicator, Image,  Pressable } from 'react-native'
import { router } from 'expo-router'
import React, { useEffect, useState, useRef } from 'react'
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

//🎨 UI
import ThemedView from 'components/ThemedView'
import ThemedText from 'components/ThemedText'
import { ArrowBigLeft, ChevronRight, ClipboardCheck, PencilLine, Radar, Trash2 } from 'lucide-react-native'

//⚛️STATE MANAGEMENT
import { useAtomValue } from 'jotai'
import { useTheme } from '../../components/ThemeContext';
import { SelectedGoalAtom} from 'atoms/GoalCategoryAtom'
import { ObjectiviesAtom, MilestonesAtom } from '../../atoms/GoalCategoryAtom';
import { completionSoundAtom } from 'atoms/notificationAtom';

//🧩COMPONENTS
import GoalsCard from 'components/GoalsCard'
import Spacer from 'components/Spacer'
import ProgressBar from 'components/ProgressBar';


//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, deleteDoc, doc, getDocs, updateDoc, onSnapshot, query, orderBy, Timestamp,} from 'firebase/firestore'

//🔤TYPES
type MilestoneDataType = {
  id: string;
  mileStoneName: string;
  mileStoneNote: string;
  targetDate: string;
  completed: boolean;
  createdAt: Timestamp | null;
}

type ObjectivesType = {
  id: string
  weekObjective: string,
  objectiveNote: string,
  lastDayOfTheWeek: string,
  completed: boolean,
  createdAt: Timestamp | null
}




const EditDeleteGoals = () => {

    const {theme, darkMode} = useTheme()

    const completeSoundRef = useRef<Audio.Sound | null>(null);
    const completionSound = useAtomValue(completionSoundAtom);


    const selectedGoal = useAtomValue(SelectedGoalAtom)
    // const setGoals = useAtomValue(GoalsAtom);
    const setObjectives = useAtomValue(ObjectiviesAtom);
    const setMilestones = useAtomValue(MilestonesAtom);

    const [loadingImages, setLoadingImages] = useState<{ [id: string]: boolean }>({});
    const [allMilestoneData, setAllMilestoneData] = useState<MilestoneDataType[]>([])
    const [mileStoneCompleted, setMilestoneCompleted] = useState<MilestoneDataType[]>([])
    const [allweeklyObjective, setAllWeeklyObjective] = useState<ObjectivesType[]>([])
    const [completedWeekleyObjective, setCompletedWeekleyObjective] = useState<ObjectivesType[]>([])    
    
    
    // 🔹 imageSource helper
    const imageSource = (image: string | number | null | undefined) => {
        if (!image) return require("../../assets/images/manwriting.png");
        return typeof image === "number" ? image : { uri: image };
    };

    const key = selectedGoal?.id || "fallback";

    
    //🔹Delete Goals
    const deleteGoal = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId || !selectedGoal) return;

        const { category, id } = selectedGoal;
        if (!category || !id) return;

        try {
            const goalRef = doc(db, "users", userId, "goals", category, "goal", id);
            await deleteDoc(goalRef);

            const goalsCol = collection(db, "users", userId, "goals", category, "goal");
            const snapshot = await getDocs(goalsCol);

            if (snapshot.empty) {
                const categoryRef = doc(db, "users", userId, "goals", category);
                await deleteDoc(categoryRef);
            }

            router.push("/Goals")

        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    //🔹Completion sound
    const completeSound = async () => {
        try {
            // Create the sound only when function is called
            const { sound } = await Audio.Sound.createAsync(
                require("../../assets/audio/claps.mp3")
            );
            completeSoundRef.current = sound;
            await completeSoundRef.current.replayAsync();

            // Optional: unload after finishing to free memory
            completeSoundRef.current.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    completeSoundRef.current?.unloadAsync();
                    completeSoundRef.current = null;
                }
            });
        } catch (err) {
            console.log("Error playing sound:", err);
        }
    };

    //🔹Complete goal function
    const handleGoalComplete = async() => {
        if(completionSound){
            await completeSound()
        }
        
        const userId = auth.currentUser?.uid
        if (!userId || !selectedGoal?.id || !selectedGoal.category) return;

        try {
            const goalRef = doc(db, "users", userId, "goals", selectedGoal.category, "goal", selectedGoal.id)

            await updateDoc(goalRef, {
                completed: true
            })

            router.push("/Goals")
        } catch (error) {
            console.log("Error updating goal", error)
        }
       
    }

    //🔹fetch milestone
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId || !selectedGoal?.id) return;
    
        const milestoneCol = collection(db, "users", userId, "goals", selectedGoal.category, "goal", selectedGoal.id, "milestones");
        const q = query(milestoneCol, orderBy("createdAt", "asc"));
    
        const unsubscribe = onSnapshot(q, snapshot => {
          const milestoneData: MilestoneDataType[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as MilestoneDataType))
    
          setAllMilestoneData(milestoneData);
    
          const completedMilesotne = milestoneData.filter(elem => elem.completed)
          setMilestoneCompleted(completedMilesotne)
    
        });
    
        return () => unsubscribe();
    }, [selectedGoal]);

    //🔹Fetch Objectivies
    useEffect(() => {
    const userId = auth.currentUser?.uid
    if(!userId || !selectedGoal?.id) return

    const objectiviesCol = collection(db, "users", userId, "goals", selectedGoal.category, "goal", selectedGoal.id, "goalObjectives")
    const q = query(objectiviesCol, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, snapshot => {
        const goalObjectiviesData : ObjectivesType [] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        } as ObjectivesType))

        const completedObjectives = goalObjectiviesData.filter(elem => elem.completed)

        setCompletedWeekleyObjective(completedObjectives)
        setAllWeeklyObjective(goalObjectiviesData)
    })


    return () => unsubscribe()

    }, [selectedGoal])

    //🔹Audio config
    useEffect(() => {
        const configureAudio = async () => {
            await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix, // ✅ updated
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix, // ✅ updated
            playThroughEarpieceAndroid: false,
            });
        };

        configureAudio();

        return () => {
            completeSoundRef.current?.unloadAsync();
        };
    }, []);




  return (
    <ThemedView style={styles.container} safe>
        <TouchableOpacity 
                onPress={() => router.back()}
                style={{top:20, left: 10,  
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 40,
                    width:50
                }}            
            >
                <ArrowBigLeft size={40} stroke="#77d1d2ff" />
        </TouchableOpacity>

        <Spacer height={35} />

        
        <View style={[styles.cardWrapper,{borderRadius: 10, borderColor: darkMode === "dark" ? theme.tabIconColor: "black", width: "95%", rowGap: 5, borderWidth: 0.4, alignSelf:"center", backgroundColor: darkMode === "dark" ? "#184e77" : "hsla(208, 97%, 86%, 0.4)"}]}>
            <View style={{flexDirection:"row", justifyContent:"space-between", borderBottomWidth: 0.5, paddingBottom: 5,  borderColor: theme.tabIconColor}}>
                <View style={{width: "10%"}}>
                    <Image
                        source={imageSource(selectedGoal?.categoryImage)}
                        style={{ width: "100%", height: undefined, aspectRatio: 1, resizeMode: "contain", borderRadius: 10 }}
                          onLoadStart={() => {
                                setLoadingImages(prev => ({ ...prev, [key]: true }));
                            }}
                            onLoadEnd={() => {
                                setLoadingImages(prev => ({ ...prev, [key]: false }));
                            }}
                        />

                        {loadingImages?.[key] &&(
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
                        {selectedGoal?.goalName}
                    </ThemedText>
                </View>
                
                
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <View style={{flexDirection:"row", columnGap: 20}}>
                    <View style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                        <Milestone size={20} stroke={theme.tabIconColor}/>
                        <ThemedText variant='smallertitle'>{mileStoneCompleted.length}/{allMilestoneData.length}</ThemedText>
                    </View>
                    <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                        <Activity size={20} stroke={theme.tabIconColor} />
                        <ThemedText variant='smallertitle'>{completedWeekleyObjective.length}/{allweeklyObjective.length}</ThemedText>
                    </View>
                </View>
                <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                    <Calendar size={20} stroke={theme.tabIconColor} />
                    <View>
                        <ThemedText variant='smallertitle'>{selectedGoal?.targetDateFormatted}</ThemedText>
                    </View>
                </View>
            </View>

          <ProgressBar width={280} height={5} progress={allMilestoneData.length === 0 ? 0 : (mileStoneCompleted.length / allMilestoneData.length)} />

            <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <View style={{justifyContent:"center", alignItems:"center"}}>
                    <ThemedText variant='subtitleBold'  style={{fontSize: 15, fontWeight: "bold", color: theme.tabIconColor}}>Category:</ThemedText>
                    <ThemedText variant='smallertitle' style={{fontSize:10}}>{selectedGoal?.category}</ThemedText>
                </View>
                <View style={{justifyContent:"center", alignItems:"center"}}>
                    <ThemedText variant='subtitleBold'  style={{fontSize: 15, fontWeight: "bold", color: theme.tabIconColor}}>Priority:</ThemedText>
                    <ThemedText variant='smallertitle' style={{fontSize:10}}>{selectedGoal?.selectedPriority}</ThemedText>
                </View>
            </View>
                    
        </View>

        <Spacer height={30} />

        <View>
            <ThemedText variant='smallertitle' style={{marginLeft: 10}}>Actions</ThemedText>

            <Spacer height={10} />

            <View style={{borderWidth: 0.4, borderColor: theme.tabIconColor, rowGap: 15, padding: 10, width: "95%", alignSelf:"center", borderRadius: 10}}>
                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom:  10, alignItems:"center"}} onPress={() => completeSound()}>
                        <View style={{flexDirection:"row", columnGap: 5}}>
                            <Image source={require("../../assets/images/openAI.png")} 
                                style={{ width: 25, height: 25 }}
                            />
                            <ThemedText variant='subtitleBold'>Ask ChatGPT!</ThemedText>
                        </View>
                        <ChevronRight size={20} stroke={theme.tabIconColor} />
                </TouchableOpacity>

                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom: 10, alignItems:"center"}} onPress={() => router.push("/(goalscreen)/TrackGoalProgress")}>
                    <View style={{flexDirection:"row", columnGap: 5}}>
                        <Radar size={25} stroke={theme.tabIconColor} />
                        <ThemedText variant='subtitleBold'>Track Progress</ThemedText>
                    </View>
                    <ChevronRight size={20} stroke={theme.tabIconColor} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}
                    onPress={() => {
                        Alert.alert(
                            "Goal Completed?",
                            "Are you sure you want to mark this goal as completed?",
                            [
                                {text: "NO", style:"cancel"},
                                {text: "YES", onPress:() => handleGoalComplete(), style: "destructive"}
                            ],
                            {cancelable: true}
                        )
                    }}
                >
                    <View style={{flexDirection:"row", columnGap: 5, }}>
                        <ClipboardCheck size={25} stroke={theme.tabIconColor} />
                        <ThemedText variant='subtitleBold'>Complete Goal</ThemedText>
                    </View>
                    <ChevronRight size={20} stroke={theme.tabIconColor} />
                </TouchableOpacity>
            </View>
        </View>

        <Spacer height={30} />

        <View>
            <ThemedText  variant='smallertitle' style={{marginLeft: 10}}> Manage</ThemedText>

            <Spacer height={10} />

            <View style={{borderWidth: 0.4, borderColor: theme.tabIconColor, rowGap: 15, padding: 10, width: "95%", alignSelf:"center", borderRadius: 10}}>
                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom:  10, alignItems:"center"}} onPress={() => router.push({ pathname: "/(goalscreen)/SetGoals", params: { selectedGoal: selectedGoal ? JSON.stringify(selectedGoal) : null } })}>
                    <View style={{flexDirection:"row", columnGap: 5}}>
                        <PencilLine size={20} stroke={theme.tabIconColor}/>
                        <ThemedText variant='subtitleBold'>Edit Goal</ThemedText>
                    </View>
                    <ChevronRight size={20}  stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            "Delete Goal",
                            "Are you sure you want to delete goal?",
                            [
                                {text: "No", style:"cancel"},
                                {text: "Yes", onPress: () => deleteGoal(), style: "destructive"}
                            ],
                            {cancelable: true}
                        )
                    }} 
                >
                    <View style={{flexDirection:"row", columnGap: 5}}>
                        <Trash2 size={20} stroke="red" />
                        <ThemedText variant='subtitleBold'>Delete Goal</ThemedText>
                    </View>
                </TouchableOpacity>
               

            </View>

        </View>


        
    </ThemedView>
  )
}

export default EditDeleteGoals

const styles = StyleSheet.create({
    container:{
        flex: 1
    }, 
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