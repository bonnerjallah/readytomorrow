import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";


// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import {ArrowBigLeft, ChevronRight } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

// IMAGES🖼️
const businessMan = require("../../assets/images/focusedman.png")
const target = require("../../assets/images/Flux.png")
const runningMan = require("../../assets/images/mansprinting.png")
const manstanding = require("../../assets/images/manstanding.png")

//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import { useSetAtom } from 'jotai';
import { GoalCategoryAtom } from '../../atoms/GoalCategoryAtom';

//🔥FIREBASE
import { auth, db } from 'firebaseConfig';
import { collection, orderBy, onSnapshot, query, Timestamp } from 'firebase/firestore';

//🔤 TYPE

type CategoryType = {
  id: string;
  category: string;
  categoryImage: string | null;
  createdAt?: any; // optional serverTimestamp
};

// Add metadata for each image
const goalCategoriesOptions = [
  { id: 1, title: "Work & Career", image: businessMan,  backgroundColor:"rgba(204, 227, 222, 0.3)" },
  { id: 3, title: "Health & Wellness", image: runningMan, backgroundColor:"rgba(104, 216, 214, 0.3)"  },
  { id: 4, title: "Money & Finances", image: manstanding, backgroundColor:"rgba(172, 236, 161, 0.3)"  },
  { id: 2, title: "Other Goals", image: target, backgroundColor:"rgba(176, 207, 239, 0.3)" },

]


const AddGoals = () => {

    const {theme} = useTheme()

    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    const [customCategory, setCustomCatogery] = useState<CategoryType[]>([]);

    const setGoalCategory = useSetAtom(GoalCategoryAtom)

    //🔹Fetch custom categories
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const categoriesCol = collection(db, "users", userId, "goals"); // categories live here
        const unsubscribe = onSnapshot(categoriesCol, (snapshot) => {
            const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            })) as CategoryType[];

            setCustomCatogery(categoriesData);
        });

        return () => unsubscribe();
    }, []);





  return (
    <ThemedView style={styles.container} safe>
        <View style={{flexDirection:'row', }}>
            <TouchableOpacity 
                onPress={() => router.back()}
                style={{top:20, left: 10,  
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 40,
                    width:"10%"
                }}            
            >
                <ArrowBigLeft size={40} stroke="#77d1d2ff" />
            </TouchableOpacity>
        </View> 

        <ThemedText variant='title' style={{textAlign:"center"}}>Select Goal Category</ThemedText>

        <Spacer height={20} />

      <ScrollView>
        {goalCategoriesOptions.map(goal => (
            <TouchableOpacity
                key={goal.id}
                style={[styles.goalOptionWrapper, {backgroundColor: goal.backgroundColor, padding:5}]}
                onPress={() => {
                    console.log("goal", goal)
                   setGoalCategory(goal)
                   router.push("(goalscreen)/SelectedGoalOption")
                }}
            >
                <View style={{flexDirection:"row", width:"85%", alignItems:"center"}}>
                    <View style={{ width: "20%", justifyContent: "center", alignItems: "center" }}>
                        <Image
                            source={goal.image}
                            style={{
                            width: "100%",
                            height: undefined,
                            aspectRatio: 1,
                            borderRadius: 10,
                            }}
                            resizeMode="contain"
                            onLoadStart={() =>
                                setLoadingImages(prev => ({ ...prev, [goal.id]: true }))
                            }
                            onLoadEnd={() =>
                                setLoadingImages(prev => ({ ...prev, [goal.id]: false }))
                            }
                        />

                        {loadingImages[goal.id] && (
                            <ActivityIndicator
                            size="small"
                            color={theme.primary}
                            style={{ position: "absolute" }} // overlay
                            />
                        )}
                    </View>

                    <View style={{marginLeft: 10}}>
                        <ThemedText variant='subtitle'>{goal.title}</ThemedText>
                    </View>
               </View>
                
                <ChevronRight size={25} stroke={theme.button}/>

            </TouchableOpacity>
        ))}

        {customCategory.length > 0 && customCategory.map((elem, idx)=> (
            <TouchableOpacity
                key={idx}
                style={[styles.goalOptionWrapper, {backgroundColor:"#cbc0d3", padding:5}]}
            >
                <View style={{flexDirection:"row", width:"85%", alignItems:"center"}}>
                    <View style={{ width: "20%", justifyContent: "center", alignItems: "center" }}>
                        <Image
                            source={require("../../assets/images/manwriting.png")}
                            style={{
                            width: "100%",
                            height: undefined,
                            aspectRatio: 1,
                            borderRadius: 10,
                            }}
                            resizeMode="contain"
                            onLoadStart={() =>
                            setLoadingImages(prev => ({ ...prev, manwriting: true }))
                            }
                            onLoadEnd={() =>
                            setLoadingImages(prev => ({ ...prev, manwriting: false }))
                            }
                        />

                        {loadingImages.manwriting && (
                            <ActivityIndicator
                            size="small"
                            color={theme.primary}
                            style={{ position: "absolute" }} // overlay
                            />
                        )}
                    </View>

                    <View style={{marginLeft: 10}}>
                        <ThemedText variant='subtitle'>{elem.category}</ThemedText>
                    </View>
               </View>
                
                <ChevronRight size={25} stroke={theme.button}/>

            </TouchableOpacity>
        ))}
      </ScrollView>

        <ThemedButton style={{width:"70%", marginBottom: 10, alignSelf:"center"}} onPress={() => router.push("/(goalscreen)/SetGoals")}>
            <ThemedText style={{color:theme.buttontitle}}>Create Category</ThemedText>
        </ThemedButton>
        

    </ThemedView>
  )
}

export default AddGoals

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    goalOptionWrapper:{
        flexDirection:"row", 
        justifyContent:"space-between", 
        margin:10, 
        borderWidth: .3,
        borderRadius: 10, 
        height: 72, 
        alignItems:"center",
        backgroundColor: "gray",

        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 4,
        elevation: 5,
    }
})