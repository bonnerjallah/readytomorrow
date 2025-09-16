import { Alert, StyleSheet, Text, TouchableOpacity, View,  ActivityIndicator, Image,  Pressable } from 'react-native'
import { router } from 'expo-router'
import React, { useState } from 'react'

//🎨 UI
import ThemedView from 'components/ThemedView'
import ThemedText from 'components/ThemedText'
import { ArrowBigLeft, ChevronRight, ClipboardCheck, PencilLine, Radar, Trash2 } from 'lucide-react-native'

//⚛️STATE MANAGEMENT
import { useAtomValue } from 'jotai'
import { SelectedGoalAtom } from 'atoms/GoalCategoryAtom'
import { useTheme } from '../../components/ThemeContext';


//🧩COMPONENTS
import GoalsCard from 'components/GoalsCard'

//🔥FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, deleteDoc, doc, getDocs} from 'firebase/firestore'
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'


//🌱 ROOT IMPORTS
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';






const EditDeleteGoals = () => {

    const {theme, darkMode} = useTheme()

    const selectedGoal = useAtomValue(SelectedGoalAtom)

    const [loadingImages, setLoadingImages] = useState<{ [id: string]: boolean }>({});
    
    // 🔹 imageSource helper
    const imageSource = (image: string | number | null | undefined) => {
        if (!image) return require("../../assets/images/manwriting.png");
        return typeof image === "number" ? image : { uri: image };
    };

    const key = selectedGoal?.id || "fallback";

    
    

    console.log("selected Goal:", selectedGoal)

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

        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };





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
                        <ThemedText variant='smallertitle'>{selectedGoal?.targetDateFormatted}</ThemedText>
                    </View>
                </View>
            </View>

            <ThemedText>Traker bar</ThemedText>

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
                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom:  10, alignItems:"center"}}>
                        <View style={{flexDirection:"row", columnGap: 5}}>
                            <Image source={require("../../assets/images/openAI.png")} 
                                style={{ width: 25, height: 25 }}
                            />
                            <ThemedText variant='subtitleBold'>Ask ChatGPT!</ThemedText>
                        </View>
                        <ChevronRight size={20} stroke={theme.tabIconColor} />
                </TouchableOpacity>

                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom: 10, alignItems:"center"}}>
                    <View style={{flexDirection:"row", columnGap: 5}}>
                        <Radar size={25} stroke={theme.tabIconColor} />
                        <ThemedText variant='subtitleBold'>Track Progress</ThemedText>
                    </View>
                    <ChevronRight size={20} stroke={theme.tabIconColor} />
                </TouchableOpacity>

                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
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
                <TouchableOpacity style={{flexDirection:"row", justifyContent:"space-between" , borderBottomWidth: 0.4, paddingBottom:  10, alignItems:"center"}}>
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