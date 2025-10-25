import { TouchableOpacity, View } from 'react-native'
import {  useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowBigLeft } from "lucide-react-native"
import React from 'react'
import { router } from 'expo-router'
import { useTheme } from './ThemeContext'

type Props = {
    style?: object
}


const BackButton = ({ style }: Props) => {
    const {theme, darkMode} = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <TouchableOpacity
        onPress={() => router.back()}
        style={{
        position: "absolute",   
        top: insets.top + 10,   // safe area aware
        left: 10,
        zIndex: 10,
        backgroundColor: darkMode === "dark" ? theme.background : "white",
        borderRadius: 10 
        }}
    >
        <ArrowBigLeft size={40} stroke= "#77d1d2ff"  />
    </TouchableOpacity>
  )
}

export default BackButton

