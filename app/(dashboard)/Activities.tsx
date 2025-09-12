// 🌱 ROOT IMPORTS
import React, { useEffect, useState, useRef, useId } from 'react'
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

// ⚛️ STATE MANAGEMENT
import { useTheme } from 'components/ThemeContext'
import { taskAtom, routineAtom } from '../../atoms/selectedTaskAtom'
import { useSetAtom } from 'jotai'

// 🎨 UI
import ThemedButton from 'components/ThemedButton'
import Spacer from 'components/Spacer'
import ThemedTextInput from 'components/ThemedTextInput'
import { ChartNoAxesColumn, SlidersHorizontal, Search } from 'lucide-react-native'
import ThemedText from 'components/ThemedText'
import ThemedView from 'components/ThemedView'

// 🧩 COMPONENTS
import DisplayOptionsModal from 'components/DisplayOptionsModal'
import TaskCard from 'components/Taskcard'
import RoutineTaskCard from "components/RoutineTaskCard"
import RescheduleModal from 'components/RescheduleModal'
import EditDeleteModal from 'components/EditDeleteModal'
import ActivitiesProgressModal from 'components/ActivitiesProgressModal'

// 💾 FIREBASE
import { auth, db } from 'firebaseConfig'
import { collection, doc, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore'

// 🔤 TYPES
type TaskType = {
  id: string
  activity: string
  note?: string
  selectedDate?: string
  selectedTime?: string
  isRecurring?: boolean
  isAllDay?: boolean
  reminder?: boolean
  selectedPart?: 'morning' | 'afternoon' | 'evening' | ''
  selectedPriority?: 'Normal' | 'High' | 'Highest' | ''
  durationDays?: number
  durationHours?: number
  durationMinutes?: number
  createdAt: any
  done: boolean
}

type RoutineType = {
  id: string
  routine: string
  note?: string
  selectedDate?: string
  selectedTime?: string
  isRecurring?: boolean
  isAllDay?: boolean
  reminder?: boolean
  selectedPart?: 'morning' | 'afternoon' | 'evening' | ''
  selectedPriority?: 'Normal' | 'High' | 'Highest' | ''
  durationDays?: number
  durationHours?: number
  durationMinutes?: number
  createdAt: any
  done: boolean
}

const Activities = () => {
  const { theme, darkMode } = useTheme()
  const setSelectedTask = useSetAtom(taskAtom)
  const setSelectedRoutine = useSetAtom(routineAtom)

  const [showDisplayOptionModal, setShowDisplayOptionModal] = useState(false)
  const [showRoutines, setShowRoutines] = useState(false)
  const [searchData, setSearchData] = useState('')

  const [allActivities, setAllActivities] = useState<TaskType[]>([])
  const [allRoutines, setAllRoutines] = useState<RoutineType[]>([])

  const [sortedActivities, setSortedActivities] = useState<TaskType[]>([])
  const [sortedRoutines, setSortedRoutines] = useState<RoutineType[]>([])

  const [showEditModal, setShowEditModal] = useState(false)
  const [showRedoModal, setShowRedoModal] = useState(false)
  const [showActivitiesProgressModal, setShowActivitiesProgressModal] = useState(false)

  // 🔹 Animations
  const routinesAnim = useRef(new Animated.Value(showRoutines ? 1 : 0)).current
  const activitiesAnim = useRef(new Animated.Value(showRoutines ? 0 : 1)).current

  // console.log("sorted routine", sortedRoutines)

  useEffect(() => {
    Animated.timing(routinesAnim, { toValue: showRoutines ? 1 : 0, duration: 300, useNativeDriver: true }).start()
    Animated.timing(activitiesAnim, { toValue: showRoutines ? 0 : 1, duration: 300, useNativeDriver: true }).start()
  }, [showRoutines])

  // 🔹 Fetch activities
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const activitiesCol = collection(db, 'users', userId, 'activities')
    const q = query(activitiesCol, orderBy('createdAt', 'asc'))

    const today = new Date()
    const dateString = today.toISOString().split("T")[0]


    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const activitiesData: TaskType[] = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as TaskType))
          .filter(elem => {
            return(
              !elem.done
            )
          })
        setAllActivities(activitiesData)
      },
      error => console.log('Error fetching activities', error)
    )

    return () => unsubscribe()
  }, [])

  // 🔹 Fetch routines
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const routinesCol = collection(db, 'users', userId, 'routines')
    const q = query(routinesCol, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const routineData: RoutineType[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoutineType))
        setAllRoutines(routineData)
      }
    )

    return () => unsubscribe()
  }, [])

  // 🔹 Update task complete
  const handleTaskComplete = async (id: string, newValue: boolean) => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    try {
      const docRef = doc(db, 'users', userId, 'activities', id)
      await updateDoc(docRef, { done: newValue })
    } catch (error) {
      console.log('Error updating task', error)
    }
  }


  // 🔹 Sorting
  const selectSortBy = (value: 'A-Z' | 'Time' | 'Date') => {
    let baseData = showRoutines ? [...allRoutines] : [...allActivities]

    if (value === 'A-Z') {
      baseData.sort((a, b) => {
        const aText = showRoutines ? (a as RoutineType).routine : (a as TaskType).activity
        const bText = showRoutines ? (b as RoutineType).routine : (b as TaskType).activity
        return aText.localeCompare(bText)
      })
    }

    if (value === 'Time') {
      baseData.sort((a, b) => {
        const aTime = a.selectedTime ? new Date(a.selectedTime).getTime() : Infinity
        const bTime = b.selectedTime ? new Date(b.selectedTime).getTime() : Infinity
        return aTime - bTime
      })
    }

    if (value === 'Date') {
      baseData.sort((a, b) => {
        const aDate = a.selectedDate ? new Date(a.selectedDate).getTime() : Infinity
        const bDate = b.selectedDate ? new Date(b.selectedDate).getTime() : Infinity
        return aDate - bDate
      })
    }

    showRoutines ? setSortedRoutines(baseData as RoutineType[]) : setSortedActivities(baseData as TaskType[])
  }

  const selectGroupBy = (value: 'Days' | 'Priority' | 'No Grouping') => {
    let baseGroup = showRoutines ? [...allRoutines] : [...allActivities]

    if (value === 'No Grouping') {
      showRoutines ? setSortedRoutines(baseGroup as RoutineType[]) : setSortedActivities(baseGroup as TaskType[])
      return
    }

    type GroupedActivity<T> = T & { groupKey: string }
    let grouped: GroupedActivity<TaskType | RoutineType>[] = []

    if (value === 'Days') {
      grouped = baseGroup.map(elem => ({
        ...elem,
        groupKey: elem.selectedDate ? new Date(elem.selectedDate).toDateString() : 'No Data'
      }))
    }

    if (value === 'Priority') {
      const priorityOrder = ['Highest', 'High', 'Normal']
      baseGroup.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.selectedPriority ?? 'Normal')
        const bIndex = priorityOrder.indexOf(b.selectedPriority ?? 'Normal')
        return aIndex - bIndex
      })
      grouped = baseGroup.map(elem => ({ ...elem, groupKey: elem.selectedPriority ?? 'Normal' }))
    }

    showRoutines ? setSortedRoutines(grouped as RoutineType[]) : setSortedActivities(grouped as TaskType[])
  }

  // 🔹 Search
  const handleSearch = (query: string) => {
    if (showRoutines) {
      const filtered = allRoutines.filter(elem => elem.routine.toLowerCase().includes(query.toLowerCase()))
      setSortedRoutines(filtered)
    } else {
      const filtered = allActivities.filter(elem => elem.activity.toLowerCase().includes(query.toLowerCase()))
      setSortedActivities(filtered)
    }
    setSearchData(query)
  }

  // 🔹 Initialize sorted lists
  useEffect(() => setSortedActivities(allActivities), [allActivities])
  useEffect(() => setSortedRoutines(allRoutines), [allRoutines])

  return (
    <ThemedView style={styles.container} safe>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity onPress={() => setShowActivitiesProgressModal(true)}>
          <ChartNoAxesColumn size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>

        <ThemedText variant="heading">Activities</ThemedText>

        <TouchableOpacity onPress={() => setShowDisplayOptionModal(true)}>
          <SlidersHorizontal size={35} stroke={darkMode === 'dark' ? '#34a0a4' : 'black'} />
        </TouchableOpacity>
      </View>

      <Spacer height={20} />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedButton
          onPress={() => setShowRoutines(false)}
          style={{ width: '45%', backgroundColor: !showRoutines ? theme.primary : '#adb5bd' }}
        >
          <ThemedText>To-Dos</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={() => setShowRoutines(true)}
          style={{ width: '45%', backgroundColor: showRoutines ? theme.primary : '#adb5bd' }}
        >
          <ThemedText>Routines</ThemedText>
        </ThemedButton>
      </View>

      <Spacer height={20} />

      {/* Search */}
      <ThemedTextInput
        placeholder="Search"
        value={searchData}
        onChangeText={handleSearch}
        keyboardType="default"
        returnKeyType="search"
        style={{backgroundColor:theme.background}}
      >
        <Search style={{ marginTop: 9 }} stroke={theme.tabIconColor} />
      </ThemedTextInput>

      <Spacer height={20} />

      {/* Scrollable List */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 10 }}>
        <View style={{ flex: 1 }}>
          {/* Routines */}
          <Animated.View
            style={{
              opacity: routinesAnim,
              transform: [
                {
                  translateX: routinesAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] })
                }
              ],
              position: 'absolute',
              width: '100%'
            }}
          >
            {sortedRoutines.map((elem, idx) => (
              <RoutineTaskCard
                key={elem.id ?? idx}
                elem={elem}
                darkMode={darkMode ?? 'light'}
                theme={theme}
                setSelectedRoutine={setSelectedRoutine}
                setShowEditModal={setShowEditModal}
                handleTaskComplete={handleTaskComplete}
                setShowRedoModal={setShowRedoModal}
              />
            ))}
          </Animated.View>

          {/* Activities */}
          <Animated.View
            style={{
              opacity: activitiesAnim,
              transform: [
                {
                  translateX: activitiesAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 0] })
                }
              ],
              width: '100%'
            }}
          >
            {sortedActivities.map((elem, idx) => (
              <TaskCard
                key={elem.id ?? idx}
                elem={elem}
                darkMode={darkMode ?? 'light'}
                theme={theme}
                setSelectedTask={setSelectedTask}
                setShowEditModal={setShowEditModal}
                handleTaskComplete={handleTaskComplete}
                setShowRedoModal={setShowRedoModal}
              />
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Modals */}
      <DisplayOptionsModal
        isVisible={showDisplayOptionModal}
        onClose={() => setShowDisplayOptionModal(false)}
        selectSortBy={selectSortBy}
        selectGroupBy={selectGroupBy}
      />
      <RescheduleModal isVisible={showRedoModal} onClose={() => setShowRedoModal(false)} />
      <EditDeleteModal isVisible={showEditModal} onClose={() => setShowEditModal(false)} />
      <ActivitiesProgressModal
        isVisible={showActivitiesProgressModal}
        onClose={() => setShowActivitiesProgressModal(false)}
      />
    </ThemedView>
  )
}

export default Activities

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
