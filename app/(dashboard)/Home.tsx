// 🌱 ROOT IMPORTS
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useState } from 'react'

// 🎨 UI
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { CalendarDays, CirclePlus, SlidersHorizontal, TableOfContents } from 'lucide-react-native'

// 🧩 COMPONENTS
import AddTaskModal from "../../components/AddTaskModal"
import DisplayOptionsModal from "../../components/DisplayOptionsModal"
import HambergurMenuModal from "../../components/HambergurMenuModal"
import ActivityInputModal from "../../components/ActivityInputModal"
import ShowDailyRitualModal from "../../components/ShowDailyRitualModal"


// ⚛️ STATE MANAGEMENT
import { useTheme } from '../../components/ThemeContext'
import ScheduleRoutineModal from '../../components/ScheduleRoutineModal'





const Home = () => {

    const {darkMode} = useTheme()

    const [showAddTaskModal, setShowAddTaskModal] = useState(false)
    const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
    const [showHamburgerModal, setShowHamburgerModal] = useState(false)
    const [showActivityInputModal, setShowActivityInputModal] = useState(false);
    const [showScheduleRoutine, setShowScheduleRoutineModal] = useState(false)
    const [showDailyRitualModal, setShowDailyRitualModal] = useState(false)


    const selectSortBy = (value: "A-Z" | "Time" | "Date") => {
        console.log("Selected sort:", value);
        
    };

    const selectGroupBy = (value: "Days" | "Goals" | "Priority" | "No Grouping") => {
        console.log("Selected group", value)
    }
    

    const selectIncludes = (value: "Recently Missed Activities" | "Skipped Activities") => {
        console.log("selectd includes", value)
    }


  return (
    <ThemedView style={styles.container} safe>

        <Spacer height={10} />

        <View style={{flexDirection: "row", justifyContent:"space-between", paddingHorizontal: 5}}>
            <TouchableOpacity
                onPress={() => setShowHamburgerModal(true)}
            >
                {darkMode === "dark" ? (
                    <TableOfContents size={35} stroke="#34a0a4" />
                ) : (
                    <TableOfContents  size={35} stroke="black" />
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setShowDisplayOptionModal(true)}
            >
                {darkMode === "dark" ? (
                    <SlidersHorizontal size={35} stroke="#34a0a4" />
                ) : (
                    <SlidersHorizontal  size={35} stroke="black" />
                )}
            </TouchableOpacity>
        </View>
        
        <Spacer height={5} />

        <View style={{borderBottomWidth: .5, borderBottomColor: "gray", paddingBottom: 15}}>

            <View style={{ flexDirection:"row", justifyContent:"space-between"}}>
                <ThemedText variant='heading' title>Today</ThemedText>
            </View>

            <View style={{flexDirection:"row", alignItems:"center", columnGap: 5}}>
                {darkMode === "dark" ? (
                    <CalendarDays size={20} stroke="#34a0a4" />
                ) : (
                    <CalendarDays  size={20} stroke="black" />
                )}
                <ThemedText title>
                    {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    })}
                    
                </ThemedText>
            </View>
        </View>

        <Spacer height={10} />

        <View style={{flex: 1}}>
            <ScrollView>
                <View>
                    
                    




                </View>
            </ScrollView>

            <Pressable
                onPress={() => setShowAddTaskModal(true)}
                style={({ pressed }) => [
                    {
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    backgroundColor: "#34a0a4",
                    borderRadius: 30,
                    padding: 15,
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 0, height: 10 },
                    shadowRadius: 4,
                    elevation: 5,
                    opacity: pressed ? 0.5 : 1, 
                    zIndex: 2
                    },
                ]}
            >
                <CirclePlus size={30} color="white" strokeWidth={2} />
            </Pressable>
        </View>

        <AddTaskModal 
            isVisible={showAddTaskModal} 
            onClose={() => setShowAddTaskModal(false)} 
            onSelect={(type) => {
                if(type === "activity") {
                    setShowAddTaskModal(false)
                    setShowActivityInputModal(true)
                } else if (type === "routine") {
                    setShowAddTaskModal(false)
                    setShowScheduleRoutineModal(true)
                } else {
                    setShowAddTaskModal(false)
                    setShowDailyRitualModal(true)
                }
                return
            }}
            
        />

        <DisplayOptionsModal isVisible={showDisplayOptionModal} onClose={() => setShowDisplayOptionModal(false)}  selectSortBy={selectSortBy} selectGroupBy={selectGroupBy} selectIncludes={selectIncludes}/>
        <HambergurMenuModal isVisible={showHamburgerModal} onClose={() => setShowHamburgerModal(false)} />
        <ActivityInputModal isVisible={showActivityInputModal} onClose={() => setShowActivityInputModal(false)}/>
        <ShowDailyRitualModal isVisible={showDailyRitualModal} onClose={() => setShowDailyRitualModal(false)}/>
        <ScheduleRoutineModal isVisible={showScheduleRoutine} onClose={() => setShowScheduleRoutineModal(false)} />

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex: 1,
    }
})