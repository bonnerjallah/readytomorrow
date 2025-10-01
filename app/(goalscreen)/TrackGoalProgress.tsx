import { StyleSheet, Text, View, TouchableOpacity, Pressable, ActivityIndicator, Image, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { useState } from 'react'


// 🎨 UI
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { Activity, Calendar, Milestone, ArrowBigLeft } from 'lucide-react-native'

// 🧩 COMPONENTS
import ProgressBar from 'components/ProgressBar'



//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import { useAtomValue, useAtom } from 'jotai'
import { SelectedGoalAtom, ObjectiviesAtom, MilestonesAtom } from 'atoms/GoalCategoryAtom'


//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, onSnapshot, query, orderBy, Timestamp,} from 'firebase/firestore'


//🔤 TYPES
type MilestoneDataType = {
  id: string;
  mileStoneName: string;
  mileStoneNote: string;
  targetDate: string;
  completed: boolean;
  goalId: string;
  createdAt: Timestamp | null;
}

type ObjectiveDataType = {
  id: string;
  objectiveName: string;  
  objectiveNote: string;
  targetDate: string;
  completed: boolean;
  goalId: string;
  createdAt: Timestamp | null;
}



type Props = {}

const TrackGoalProgress = (props: Props) => {

    const {theme, darkMode} = useTheme()

    const selectedGoal = useAtomValue(SelectedGoalAtom)
    const goalObjectivies = useAtomValue(ObjectiviesAtom)
    const goalMilestone = useAtomValue(MilestonesAtom)

    const [loadingImages, setLoadingImages] = useState<{ [id: string]: boolean }>({});
    const [allMilestoneData, setAllMilestoneData] = useState<MilestoneDataType[]>([])
    const [mileStoneCompleted, setMilestoneCompleted] = useState<MilestoneDataType[]>([])
    const [allweeklyObjective, setAllWeeklyObjective] = useState<ObjectiveDataType[]>([])
    const [completedWeekleyObjective, setCompletedWeekleyObjective] = useState<ObjectiveDataType[]>([])
    const [progressPercentage, setProgressPercentage] = useState<number>(0);

    

    // 🔹 imageSource helper
    const imageSource = (image: string | number | null | undefined) => {
        if (!image) return require("../../assets/images/manwriting.png");
        return typeof image === "number" ? image : { uri: image };
    };

    const key = selectedGoal?.id || "fallback";

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
        const goalObjectiviesData : ObjectiveDataType [] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        } as ObjectiveDataType))

        const completedObjectives = goalObjectiviesData.filter(elem => elem.completed)

        setCompletedWeekleyObjective(completedObjectives)
        setAllWeeklyObjective(goalObjectiviesData)
    })


    return () => unsubscribe()

    }, [selectedGoal])

     // 🔹 milestone and objectives completed
    useEffect(() => {
        const completedMilestone = goalMilestone.filter(elem => elem.goalId !== selectedGoal?.id && elem.completed);
        const completedObjectives = goalObjectivies.filter(elem => elem.goalId !== selectedGoal?.id && elem.completed);

        const allCompleted = [...completedMilestone, ...completedObjectives];
        const allItems = [...goalMilestone, ...goalObjectivies];

        const percentage = allItems.length > 0 ? Math.round((allCompleted.length / allItems.length) * 100 ) : 0;


        setProgressPercentage(percentage); 
    }, [selectedGoal, goalMilestone, goalObjectivies]);







  return (
    <ThemedView style={styles.container} safe>
        <Spacer height={20} />

        <View style={{flexDirection:"row", justifyContent:'space-around', alignItems:"center"}}>
            <TouchableOpacity 
            onPress={() => router.back()}
                style={{ 
                    borderRadius: 40,
                    width:50,
                }}
            >
                <ArrowBigLeft size={40} stroke="#77d1d2ff" />
            </TouchableOpacity>

            <ThemedText variant='title' style={{marginTop: 10, marginLeft: -10, }}>Track Goal Progress</ThemedText>

            <Pressable
                onPress={() => router.back()}
                style={({pressed}) => [
                    styles.doneButton,
                    pressed && {backgroundColor: theme.primary}
                ]}
            >
                <ThemedText style={{color: "white"}}>Done</ThemedText>
            </Pressable>
        </View>

        <Spacer height={25} />

        <View style={[styles.cardWrapper,{borderRadius: 10, borderColor: darkMode === "dark" ? theme.tabIconColor: "black", width: "95%", rowGap: 5, borderWidth: 0.4, alignSelf:"center", backgroundColor: darkMode === "dark" ? "#184e77" : "hsla(208, 97%, 86%, 0.4)"}]}>
            <View style={{flexDirection:"row", justifyContent:"space-between", borderBottomWidth: 0.5, paddingBottom: 5,  borderColor: theme.tabIconColor}}>
                <View style={{width: "10%"}}>
                    <Image 
                        source={imageSource(selectedGoal?.categoryImage)}
                        style={{width:"100%", height: undefined, aspectRatio: 1, resizeMode:"contain", borderRadius: 10}}

                        onLoadStart={() => {
                            const key = typeof selectedGoal?.categoryImage === "string" ? selectedGoal?.categoryImage : "fallback";
                            setLoadingImages(prev => ({ ...prev, [key]: true }));
                        }}
                        onLoadEnd={() => {
                            const key = typeof selectedGoal?.categoryImage === "string" ? selectedGoal?.categoryImage : "fallback";
                            setLoadingImages(prev => ({ ...prev, [key]: false }));
                        }}
                    />

                    {loadingImages?.[selectedGoal?.id ?? "fallback"] && (
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
                        <ThemedText variant='smallertitle'>{mileStoneCompleted?.length ?? 0}/{allMilestoneData?.length ?? 0}</ThemedText>
                    </View>
                    <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                        <Activity size={20} stroke={theme.tabIconColor} />
                        <ThemedText variant='smallertitle'>{completedWeekleyObjective?.length ?? 0}/{allweeklyObjective?.length ?? 0}</ThemedText>
                    </View>
                </View>
                <View  style={{flexDirection:"row", alignItems:"center", columnGap:5}}>
                    <Calendar size={20} stroke={theme.tabIconColor} />
                    <View>
                        <ThemedText variant='smallertitle'>{selectedGoal?.targetDateFormatted}</ThemedText>
                    </View>
                </View>
            </View>
                    
        </View>

        <Spacer height={20} />

        <View style={[styles.cardWrapper,{borderRadius: 10, borderColor: darkMode === "dark" ? theme.tabIconColor: "black", width: "95%", rowGap: 5, borderWidth: 0.4, alignSelf:"center", justifyContent:"space-between", flexDirection:'row', backgroundColor: darkMode === "dark" ? "#184e77" : "hsla(208, 97%, 86%, 0.4)"}]}>
            <ThemedText variant='subtitleBold'>
                Progress 
            </ThemedText>
            <View style={{flexDirection:"row", alignItems:"center", columnGap: 10}}>
                <ThemedText>{progressPercentage}%</ThemedText>
                <ProgressBar width={200} height={5} progress={progressPercentage / 100} />
            </View>
        </View>

        <Spacer height={20} />

        <View>
            <ThemedText variant='title'>Milestones</ThemedText>

            <View>
                <FlatList<MilestoneDataType>
                    data={Array.isArray(goalMilestone) ? goalMilestone.filter(elem => elem.goalId === selectedGoal?.id) : []}
                    keyExtractor={(item, indx) => item.id?.toString() ?? indx.toString()}
                    renderItem={({ item }) => (
                        <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 4,
                            marginVertical: 6,
                            marginHorizontal: 10,
                            borderRadius: 10,
                            backgroundColor: darkMode === "dark" ? "#1e293b" : "#f8fafc",
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        >
                        {/* Left side: title + note */}
                        <View style={{ flex: 1 }}>
                            <ThemedText variant="subtitleBold" style={{ marginBottom: 4 }}>
                            {item.mileStoneName}
                            </ThemedText>
                        </View>

                        {/* Right side: target date + status */}
                        <View style={{ alignItems: "flex-end" }}>
                            <ThemedText
                            variant="smallertitle"
                            style={{ color: darkMode === "dark" ? "#cbd5e1" : "#475569" }}
                            >
                            {item.targetDate}
                            </ThemedText>

                            {item.completed ? (
                                <View
                                    style={{
                                    marginTop: 6,
                                    backgroundColor: "#34a853",
                                    borderRadius: 20,
                                    paddingHorizontal: 10,
                                    paddingVertical: 2,
                                    }}
                                >
                                    <ThemedText style={{ color: "white", fontSize: 12 }}>
                                    Completed
                                    </ThemedText>
                                </View>
                                ) : (
                                <View
                                    style={{
                                    marginTop: 6,
                                    backgroundColor: "#e2e8f0",
                                    borderRadius: 20,
                                    paddingHorizontal: 10,
                                    paddingVertical: 2,
                                    }}
                                >
                                    <ThemedText style={{ color: "#475569", fontSize: 12 }}>
                                    Pending
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                        </View>
                    )}
            />

            </View>
        </View>

    </ThemedView>
  )
}

export default TrackGoalProgress

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    doneButton:{
        borderRadius: 10,
        padding: 4,
        backgroundColor: "#77d1d2ff",
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
    },
    progressContainer:{
        flexDirection:"row", 
        alignItems:"center", 
        justifyContent:"space-around",
        
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