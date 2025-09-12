import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { ReactNode, useRef } from 'react'
import ThemedText from './ThemedText'
import { Activity, Calendar, EllipsisVertical, Milestone } from 'lucide-react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet"


// ⚛️STATE MANAGEMENT
import { useTheme } from './ThemeContext'
import ThemedView from './ThemedView';

// 🔤 TYPE
type GoalsLayoutProps = {
  children?: ReactNode
  snapPoint?: string[];   // since you're passing ["25%", "50%"]
  index?: number;
};

const GoalsLayout = ({children, snapPoint=["25%", "50%"], index= 0} : GoalsLayoutProps) => {

    const {theme, darkMode} = useTheme()
    const bottomSheetRef = useRef<BottomSheet>(null)

  return (
    <GestureHandlerRootView>
        <ThemedView>
            <View style={{borderRadius: 10, width: "95%", rowGap: 25, padding: 10, alignSelf:"center", backgroundColor: darkMode === "dark" ? "rgba(114, 60, 112, 0.7)" : "hsla(208, 97%, 86%, 0.4)"}}>
                <View style={{flexDirection:"row", justifyContent:"space-between", columnGap: 5}}>
                    <View style={{width: "20%", borderWidth: 1}}>
                        <Image 
                        
                        />
                    </View>
                    <View style={{borderWidth: 1, width:"70%"}} >
                        <ThemedText>
                            goals here
                        </ThemedText>
                    </View>
                    <EllipsisVertical />
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <View style={{flexDirection:"row", columnGap: 20}}>
                        <View style={{flexDirection:"row"}}>
                            <Milestone size={20}/>
                        </View>
                        <View  style={{flexDirection:"row"}}>
                            <Activity size={20} />
                        </View>
                    </View>
                    <View  style={{flexDirection:"row"}}>
                        <Calendar size={20} />
                    </View>
                </View>
                <>
                    <ThemedText>Traker bar</ThemedText>
                </>
            </View>

            <View>
                
            </View>
        </ThemedView>
        
    </GestureHandlerRootView>
    
  )
}

export default GoalsLayout

const styles = StyleSheet.create({})