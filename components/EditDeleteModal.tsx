// 🌱 ROOT IMPORTS
import { ArrowBigLeft, ChevronRight, CircleX, Logs, PencilLine, Trash2,  } from "lucide-react-native";
import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Alert 
} from "react-native";


// 🎨 UI
import Spacer from '../components/Spacer'
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { CalendarSync  } from 'lucide-react-native'
import EditActivityModal from "../components/EditActivityModal"

// ⚛️ STATE MANAGEMENT
import { useTheme } from "./ThemeContext";
import { useAtomValue } from "jotai";
import { taskAtom } from "atoms/selectedTaskAtom";
import { selectedItemTypeAtom } from "atoms/selectedTaskAtom";
import { routineAtom as selectedRoutineAtom } from "atoms/selectedTaskAtom";



// 🔤 TYPES
type DisplayOptionsModalProps = {
  isVisible: boolean;
  onClose: () => void;
}


// 💾 FIREBASE
import { auth, db } from "firebaseConfig";
import { doc, deleteDoc} from 'firebase/firestore'




const EditDeleteModal = ({isVisible, onClose}: DisplayOptionsModalProps) => {

    const {theme, darkMode} = useTheme()
    
    const selectedTask = useAtomValue(taskAtom)
    const selectedRoutine = useAtomValue(selectedRoutineAtom);

    const selectedItemType = useAtomValue(selectedItemTypeAtom)
    


    const [showEditActivityModal, setEditActivityModal] = useState(false)


  const handleDeleteTask = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  let itemToEdit;
  let collectionName: string;

  if (selectedItemType === "task") {
    itemToEdit = selectedTask;
    console.log("itemtoedit", itemToEdit)
    collectionName = "activities";
  } else if (selectedItemType === "routine") {
    itemToEdit = selectedRoutine;
    collectionName = "routines";
  } else {
    return Alert.alert("No item type selected");
  }

  if (!itemToEdit?.id) return Alert.alert("No item selected to delete");

  try {
    const docRef = doc(db, "users", userId, collectionName, itemToEdit.id);
    await deleteDoc(docRef);
    onClose();
  } catch (error) {
    console.log("Error deleting item", error);
    Alert.alert("Error", "Could not delete the item");
  }
};



  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="slide">
       

      <ThemedView style={[{backgroundColor: theme.background, marginTop: 50 }, styles.container]} safe>
            <TouchableOpacity 
                style={{
                    position: "absolute",
                    top: 45,
                    left: 20
                }} 
                onPress={onClose}
            >
                <ArrowBigLeft size={40} stroke="#77d1d2ff" />
            </TouchableOpacity>

            <ThemedText style={{alignSelf: "center"}} variant="title">
                Edit or delete task
            </ThemedText>

            <Spacer height={50} />

            
        

            <View>
                <ThemedText variant="smallertitle">Manage</ThemedText>
                <TouchableOpacity
                    onPress={() => setEditActivityModal(true)}
                >
                    <View style={[styles.optionsWrapper, {justifyContent: "space-between", marginTop: 10, borderColor: darkMode === "dark" ? "gray" : "black"}]}>
                        <View style={{flexDirection: "row", columnGap: 20, alignItems:"center"}}>
                            <PencilLine  size={20} stroke={theme.primary}/>
                            <ThemedText>Edit Activity</ThemedText>
                        </View>
                        <ChevronRight 
                            stroke={theme.tabIconColor}
                        />
                    </View>
                </TouchableOpacity>
                

                <Spacer height={15} />

                <TouchableOpacity
                    onPress={() => handleDeleteTask()}
                >
                    <View style={[styles.optionsWrapper, {borderColor: darkMode === "dark" ? "gray" : "black"}]}>
                        <Trash2 size={20} stroke= "red"/>
                        <ThemedText style={{color: "red"}}>Delete Activity</ThemedText>
                    </View>
                </TouchableOpacity>
                
            </View>

            <EditActivityModal isVisible={showEditActivityModal} onClose={() => setEditActivityModal(false)} />

      </ThemedView>
    </Modal>
  )
}

export default EditDeleteModal

const styles = StyleSheet.create({
     container: {
    flex: 1,
    },

    optionsWrapper:{
        flexDirection: "row", 
        columnGap: 20, 
        alignItems:"center", 
        borderWidth: 0.2, 
        borderRadius: 10, 
        height: 45,
        paddingHorizontal: 10

    }
})