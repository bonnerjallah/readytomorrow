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


type ActivityInputModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const ScheduleRoutineModal = ({isVisible, onClose} : ActivityInputModalProps) => {

  const {theme} = useTheme()

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

                <TouchableOpacity style={styles.options}>            
                  <ThemedText >📩 Check Emails</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🗓️ Schedule Meetings</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>📚 Learn A New Skill</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}>
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

                <TouchableOpacity style={styles.options}>            
                  <ThemedText>📱 Call Or Message A Family Member</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🎲 Plan A Family Activity</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🍴 Host Family Dinner</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}>
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

                <TouchableOpacity style={styles.options}>            
                  <ThemedText>📖 Read A Book</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>            
                  <ThemedText>🏀 Favorite Sport</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🎹 Play An Instrument</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>📺 Watch A Documentry</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🍿 Movie Night</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🎨 Enjoy A Hobby Or Craft</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}>
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

                <TouchableOpacity style={styles.options}>            
                  <ThemedText>🏋🏾‍♀️ Workout or Exercise</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>⚽ Play Sports</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>💊 Take Vitamins or Supplements</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>💧 Drink Water</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🛌🏾 Sleep Early</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🧘🏾‍♂️ Meditate</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>👟 Go Walking</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}>
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

                <TouchableOpacity style={styles.options}>            
                  <ThemedText>🏦 Check Bank Account Balances</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>📈 Review Investment Performance</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>📊 Invest Or Research Investment</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>📋 Review Financial Plan</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>💳 Pay Bills</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>🎯 Set Up Finacial Goals</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.options}>
                  <ThemedText>💵 Track Expenses</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>

                <TouchableOpacity style={{justifyContent: 'space-between', flexDirection:"row"}}>
                  <ThemedText>👐🏽 Donate To Charity</ThemedText>
                  <ChevronRight stroke={theme.tabIconColor}/>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </View>

        </ScrollView>

        <ThemedButton  style={{alignSelf:"center", marginTop: 10}}>
          <ThemedText>
            Create My Own
          </ThemedText>
        </ThemedButton>

      </ThemedView>
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