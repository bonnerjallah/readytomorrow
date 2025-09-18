import { StyleSheet, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useRef, useState, ReactNode } from 'react'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetScrollView} from '@gorhom/bottom-sheet'

// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import { ArrowBigLeft, ChevronRight } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

//⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import { useAtomValue, useSetAtom } from 'jotai'
import { GoalCategoryAtom, GoalIdeaAtom } from 'atoms/GoalCategoryAtom'



const workCareerGoals = [
  "Earn a promotion",
  "Start My Own Business",
  "Learn a new professional skill",
  "Complete a certification or course",
  "Expand professional network",
  "Improve productivity",
  "Update portfolio or resume",
  "Lead a project",
  "Explore career change or advancement",
  "Achieve better work-life balance",
];

const healthWellnessGoals = [
  "Exercise Regularly",
  "Eat a Balanced Diet",
  "Drink More Water",
  "Get Enough Sleep",
  "Practice Mindfulness / Meditation",
  "Reduce Stress",
  "Quit Smoking or Reduce Alcohol",
  "Regular Medical Checkups",
  "Improve Mental Health",
  "Increase Flexibility / Mobility"
];

const moneyFinanceGoals = [
  "Create a Budget",
  "Build an Emergency Fund",
  "Pay Off Debt",
  "Save for Retirement",
  "Invest in Stocks or ETFs",
  "Track Expenses Regularly",
  "Increase Income / Side Hustle",
  "Improve Credit Score",
  "Plan for Large Purchases",
  "Financial Education / Learning"
];

const newGoalIdeas = [
  "Learning & Education",
  "Personal Development",
  "Relationships & Social Life",
  "Travel & Adventure",
  "Creativity & Hobbies", 
  "Spirituality & Mindfulness", 
  "Home & Environment", 
  "Community & Volunteering", 
  "Sustainability & Eco-Goals", 
  "Digital & Technology Goals", 
];




const SelectedGoalOption = () => {

    const {theme} = useTheme()
    const bottomSheetRef = useRef<BottomSheet>(null)

    const goalCatogory = useAtomValue(GoalCategoryAtom)
    const setGoalIdea = useSetAtom(GoalIdeaAtom)


    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

   
    console.log("goal category", goalCatogory)

    

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            <ThemedView style={styles.container} safe>
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


                <ThemedText variant='title' style={{textAlign:"center"}}>Add Goal</ThemedText>


                <Spacer height={20} />

                {goalCatogory?.title === "Work & Career" ? (
                    <View>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", columnGap: 10, borderBottomWidth:0.4, paddingBottom: 15 }}>
                            <Image
                                source={goalCatogory.image}
                                style={{ width: "15%", height: undefined, aspectRatio: 1, borderRadius: 10 }}
                                onLoadStart={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title]: true }))
                                }
                                onLoadEnd={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title  ]: false }))
                                }
                            />
                            {loadingImages[goalCatogory.title] && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.primary}
                                    style={{ position: "absolute" }} // overlay
                                />
                            )}
                            <ThemedText variant='subtitle'>{goalCatogory.title}</ThemedText>
                        </View>

                        <Spacer height={10} />

                        <ScrollView>
                            {workCareerGoals.map((elem, index) => (
                                <View key={index}>
                                    <TouchableOpacity style={styles.selectionWrapper}
                                        onPress={() => {
                                            setGoalIdea(elem)
                                            router.push("/(goalscreen)/PowerByAI")
                                        }}
                                        
                                    >
                                        <ThemedText>{elem}</ThemedText>
                                        <ChevronRight size={25} stroke={theme.button} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ) : goalCatogory?.title === "Health & Wellness" ? (
                    <View>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", columnGap: 10, borderBottomWidth:0.4, paddingBottom: 15 }}>
                            <Image
                                source={goalCatogory.image}
                                style={{ width: "15%", height: undefined, aspectRatio: 1, borderRadius: 10 }}
                                onLoadStart={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title]: true }))
                                }
                                onLoadEnd={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title  ]: false }))
                                }
                            />
                            {loadingImages[goalCatogory.title] && (
                                <ActivityIndicator
                                size="small"
                                color={theme.primary}
                                style={{ position: "absolute" }} // overlay
                                />
                            )}
                            <ThemedText variant='subtitle'>{goalCatogory.title}</ThemedText>
                        </View>

                        <Spacer height={30} />

                        <ScrollView>
                            {healthWellnessGoals.map((elem, index) => (
                                <View key={index}>
                                    <TouchableOpacity style={styles.selectionWrapper}
                                        onPress={() => {
                                            setGoalIdea(elem)
                                            router.push("/(goalscreen)/PowerByAI")
                                        }}
                                    >
                                        <ThemedText>{elem}</ThemedText>
                                        <ChevronRight size={25} stroke={theme.button} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ) : goalCatogory?.title === "Money & Finances" ? (
                    <View>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", columnGap: 10, borderBottomWidth:0.4, paddingBottom: 15 }}>
                            <Image
                                source={goalCatogory.image}
                                style={{ width: "15%", height: undefined, aspectRatio: 1, borderRadius: 10 }}
                                onLoadStart={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title]: true }))
                                }
                                onLoadEnd={() =>
                                    setLoadingImages(prev => ({ ...prev, [goalCatogory.title  ]: false }))
                                }
                            />
                            {loadingImages[goalCatogory.title] && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.primary}
                                    style={{ position: "absolute" }} // overlay
                                />
                            )}
                            <ThemedText variant='subtitle'>{goalCatogory.title}</ThemedText>            
                        </View>

                        <Spacer height={30} />

                        <ScrollView>
                            {moneyFinanceGoals.map((elem, index) => (
                                <View key={index}>
                                    <TouchableOpacity style={styles.selectionWrapper}
                                        onPress={() => {
                                            setGoalIdea(elem)
                                            router.push("/(goalscreen)/PowerByAI")
                                        }}
                                    >
                                        <ThemedText>{elem}</ThemedText>
                                        <ChevronRight size={25} stroke={theme.button} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                    
                ) : (
                    <View>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", columnGap: 10, borderBottomWidth:0.4, paddingBottom: 15 }}>
                            <Image
                                source={require("../../assets/images/Flux.png")}
                                style={{ width: "15%", height: undefined, aspectRatio: 1, borderRadius: 10 }}
                                onLoadStart={() =>
                                    setLoadingImages(prev => ({ ...prev, Flux: true }))
                                }
                                onLoadEnd={() =>
                                    setLoadingImages(prev => ({ ...prev, Flux: false }))
                                }
                            />
                            {loadingImages.Flux && (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.primary}
                                    style={{ position: "absolute" }} // overlay
                                />
                            )}
                            <ThemedText variant='subtitle'>{goalCatogory?.title}</ThemedText>            
                        </View>

                        <Spacer height={30} />

                        <ScrollView>
                            {newGoalIdeas.map((elem, index) => (
                                <View key={index}>
                                    <TouchableOpacity style={styles.selectionWrapper}
                                        onPress={() => {
                                            setGoalIdea(elem)
                                            router.push("/(goalscreen)/PowerByAI")
                                        }}
                                    >
                                        <ThemedText>{elem}</ThemedText>
                                        <ChevronRight size={25} stroke={theme.button} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}


                <Spacer height={10} />

                <ThemedButton style={{width:"70%", marginBottom: 10, alignSelf:"center"}} onPress={() => router.push("/(goalscreen)/SetGoals")}>
                    <ThemedText style={{color:theme.buttontitle}}>Create My Own</ThemedText>
                </ThemedButton>

            </ThemedView>
        </GestureHandlerRootView>
         
    )
}

export default SelectedGoalOption

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    selectionWrapper:{
        flexDirection:"row", 
        justifyContent:'space-between',
        borderWidth: 0.5,
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        backgroundColor:"hsla(225, 18%, 39%, 0.4)",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 4,
        elevation: 5,
    }
})