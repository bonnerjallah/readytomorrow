  // 🌱 ROOT IMPORTS
  import { StyleSheet, View, Modal, TouchableOpacity, Alert, Animated, Easing, Switch, TouchableWithoutFeedback, Platform, Pressable, ScrollView } from 'react-native'
  import { useState, useEffect } from 'react';
  import DateTimePicker from "@react-native-community/datetimepicker";

  
  // ⚛️ STATE MANAGEMENT
  import { useTheme } from './ThemeContext';
  

  // 🎨 UI
  import Spacer from "../components/Spacer"
  import ThemedView from './ThemedView';
  import ThemedText from './ThemedText';
  import ThemedTextInput from './ThemedTextInput';
  import { ChevronUp, Plus, CircleX, ChevronDown, ChevronRight } from 'lucide-react-native';
  import ThemedButton from './ThemedButton';
  import RoutineInputModal from "./RoutineInputModal"


type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ScheduleRoutineModal = ({isVisible, onClose} : ActivityInputModalProps) => {

  const {theme} = useTheme()

  const [showRoutineInputModal, setShowRoutineInputModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")

  
  const [droupDowns, setDroupDown] = useState([
    {open: false, height: new Animated.Value(0), opacity: new Animated.Value(0)},
    {open: false, height: new Animated.Value(0), opacity: new Animated.Value(0)},
    {open: false, height: new Animated.Value(0), opacity: new Animated.Value(0)},
    {open: false, height: new Animated.Value(0), opacity: new Animated.Value(0)},
    {open: false, height: new Animated.Value(0), opacity: new Animated.Value(0)}
  ])

  const dropdownHeights = [200, 210, 350, 300, 350]

  const toggleDroupDown = (index: number) => {
    const newDroupDowns = [...droupDowns]
    const current = newDroupDowns[index] 

    const targetHeight = current.open ? 0 : dropdownHeights[index]

    Animated.parallel([
      Animated.timing(current.height, {
        toValue: targetHeight,
        duration: 300,
        useNativeDriver: false, 
      }),
      Animated.timing(current.opacity, {
        toValue: current.open ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    current.open = !current.open;

    setDroupDown(newDroupDowns);
  }



  const handleCreateMyOwn = () => {
    setSelectedOption("");           
    setShowRoutineInputModal(true);  
  };


  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <ThemedView style={styles.container} safe>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CircleX size={40} stroke="#77d1d2ff" onPress={onClose} />
          <ThemedText style={{ textAlign: "center", width: "83%" }} variant='title'>Add Routine</ThemedText>
        </View>

        <Spacer height={40} />

        <ScrollView
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.tab}>
            <TouchableOpacity
              style={{backgroundColor: "rgba(170, 118, 124, 0.3)", width: "100%",  borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: "space-between", flexDirection:"row", alignItems:"center", padding: 10}}
              onPress={() => toggleDroupDown(0)}
            >
              <ThemedText variant='title' title>💼 Bussiness</ThemedText>
              <Animated.View
                style={{
                  transform:[{
                    rotate: droupDowns[0].open ? "90deg" : "0deg"
                  }]
                }}
              >
                <ChevronRight />
              </Animated.View>
            </TouchableOpacity>


            <Animated.View
              style={[ {height: droupDowns[0].height, opacity: droupDowns[0].opacity}]}
            >
              <View style={styles.optionsContainer}>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📩 Check Emails")
                  }}
                >            
                  <ThemedText >📩 Check Emails</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🗓️ Schedule Meetings")
                  }}
                >
                  <ThemedText>🗓️ Schedule Meetings</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📚 Learn A New Skill")
                  }}
                >
                  <ThemedText>📚 Learn A New Skill</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("💡 Brainstorm New Ideas")
                  }}
                >
                  <ThemedText>💡 Brainstorm New Ideas</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

          <Spacer height={15} />

          <View style={styles.tab}>
            <TouchableOpacity
              style={{backgroundColor: "rgba(168, 159, 104, 0.4)", width: "100%",  borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: "space-between", flexDirection:"row", alignItems:"center", padding: 10}}
              onPress={() => toggleDroupDown(1)}
            >
              <ThemedText variant='title' title>🏠 Family </ThemedText>
              <Animated.View
                style={{
                  transform:[{
                    rotate: droupDowns[1].open ? "90deg" : "0deg"
                  }]
                }}
              >
                <ChevronRight />
              </Animated.View>
            </TouchableOpacity>


            <Animated.View
              style={[ {height: droupDowns[1].height, opacity: droupDowns[1].opacity}]}
            >
              <View style={styles.optionsContainer}>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📱 Call Or Message A Family Member")
                  }}
                >            
                  <ThemedText>📱 Call Or Message A Family Member</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🎲 Plan A Family Activity")
                  }}
                >
                  <ThemedText>🎲 Plan A Family Activity</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🍴 Host Family Dinner")
                  }}
                >
                  <ThemedText>🍴 Host Family Dinner</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🌍 Arrange A Family Vacation")
                  }}
                >
                  <ThemedText>🌍 Arrange A Family Vacation</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

          <Spacer height={15} />

          <View style={styles.tab}>
            <TouchableOpacity
              style={{backgroundColor: "#ffa686", width: "100%",  borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: "space-between", flexDirection:"row", alignItems:"center", padding: 10}}
              onPress={() => toggleDroupDown(2)}
            >
              <ThemedText variant='title' title>🏖️ Recreation & Lifestyle </ThemedText>
              <Animated.View
                style={{
                  transform:[{
                    rotate: droupDowns[2].open ? "90deg" : "0deg"
                  }]
                }}
              >
                <ChevronRight />
              </Animated.View>
            </TouchableOpacity>


            <Animated.View
              style={[ {height: droupDowns[2].height, opacity: droupDowns[2].opacity}]}
            >
              <View style={styles.optionsContainer}>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📖 Read A Book")
                  }}
                >            
                  <ThemedText>📖 Read A Book</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🏀 Favorite Sport")
                  }}
                >            
                  <ThemedText>🏀 Favorite Sport</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🎹 Play An Instrument")
                  }}
                >
                  <ThemedText>🎹 Play An Instrument</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📺 Watch A Documentry")
                  }}
                >
                  <ThemedText>📺 Watch A Documentry</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🍿 Movie Night")
                  }}
                >
                  <ThemedText>🍿 Movie Night</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🎨 Enjoy A Hobby Or Craft")
                  }}
                >
                  <ThemedText>🎨 Enjoy A Hobby Or Craft</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🚗 Explore A New Place")
                  }}
                >
                  <ThemedText>🚗 Explore A New Place</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

          <Spacer height={15} />

          <View style={styles.tab}>
            <TouchableOpacity
              style={{backgroundColor: "rgba(87, 175, 205, 0.3)", width: "100%",  borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: "space-between", flexDirection:"row", alignItems:"center", padding: 10}}
              onPress={() => toggleDroupDown(3)}
            >
              <ThemedText variant='title' title>👨🏼‍⚕️ Health & Wellness</ThemedText>
              <Animated.View
                style={{
                  transform:[{
                    rotate: droupDowns[3].open ? "90deg" : "0deg"
                  }]
                }}
              >
                <ChevronRight />
              </Animated.View>
            </TouchableOpacity>


            <Animated.View
              style={[ {height: droupDowns[3].height, opacity: droupDowns[3].opacity}]}
            >
              <View style={styles.optionsContainer}>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🏋🏾‍♀️ Workout or Exercise")
                  }}
                >            
                  <ThemedText>🏋🏾‍♀️ Workout or Exercise</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("⚽ Play Sports")
                  }}
                >
                  <ThemedText>⚽ Play Sports</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("💊 Take Vitamins or Supplements")
                  }}
                >
                  <ThemedText>💊 Take Vitamins or Supplements</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("💧 Drink Water")
                  }}
                >
                  <ThemedText>💧 Drink Water</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🛌🏾 Sleep Early")
                  }}
                >
                  <ThemedText>🛌🏾 Sleep Early</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🧘🏾‍♂️ Meditate")
                  }}
                >
                  <ThemedText>🧘🏾‍♂️ Meditate</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("👟 Go Walking")
                  }}
                >
                  <ThemedText>👟 Go Walking</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🏃🏾‍♀️ Go Running")
                  }}
                >
                  <ThemedText>🏃🏾‍♀️ Go Running</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

          <Spacer height={15} />

          <View style={styles.tab}>
            <TouchableOpacity
              style={{backgroundColor: "#606c38", width: "100%",  borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: "space-between", flexDirection:"row", alignItems:"center", padding: 10}}
              onPress={() => toggleDroupDown(4)}
            >
              <ThemedText variant='title' title>💰 Finances</ThemedText>
              <Animated.View
                style={{
                  transform:[{
                    rotate: droupDowns[4].open ? "90deg" : "0deg"
                  }]
                }}
              >
                <ChevronRight />
              </Animated.View>
            </TouchableOpacity>


            <Animated.View
              style={[ {height: droupDowns[4].height, opacity: droupDowns[4].opacity}]}
            >
              <View style={styles.optionsContainer}>

                <TouchableOpacity style={styles.options}
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🏦 Check Bank Account Balances")
                  }}
                  
                >            
                  <ThemedText>🏦 Check Bank Account Balances</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📈 Review Investment Performance")
                  }}
                >
                  <ThemedText>📈 Review Investment Performance</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📊 Invest Or Research Investment")
                  }}
                >
                  <ThemedText>📊 Invest Or Research Investment</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("📋 Review Financial Plan")
                  }}
                >
                  <ThemedText>📋 Review Financial Plan</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("💳 Pay Bills")
                  }}
                >
                  <ThemedText>💳 Pay Bills</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("🎯 Set Up Finacial Goals")
                  }}
                >
                  <ThemedText>🎯 Set Up Finacial Goals</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("💵 Track Expenses")
                  }}
                >
                  <ThemedText>💵 Track Expenses</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}} 
                  onPress={() => {
                    setShowRoutineInputModal(true)
                    setSelectedOption("👐🏽 Donate To Charity")
                  }}
                >
                  <ThemedText>👐🏽 Donate To Charity</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

        </ScrollView>

        <ThemedButton  style={{alignSelf:"center", marginTop: 10}} onPress={handleCreateMyOwn}>
          <ThemedText>
            Create My Own
          </ThemedText>
        </ThemedButton>
        

      </ThemedView>

      <RoutineInputModal isVisible={showRoutineInputModal} onClose={() => setShowRoutineInputModal(false)} selectedOption={selectedOption} />
                
    </Modal>
  )
}

export default ScheduleRoutineModal

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  tab:{borderWidth: 0.4, borderRadius: 10, overflow: "hidden", borderColor:"#ccc"},
  tabHeader: {},
  optionsContainer: {padding: 10, rowGap: 15},
  options: {borderBottomWidth: 0.3, paddingBottom: 5, justifyContent: 'space-between', flexDirection:"row", borderColor:"#ccc"}

})