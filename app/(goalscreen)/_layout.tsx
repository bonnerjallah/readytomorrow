import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";

import { getAuth } from "firebase/auth";
import { useEffect } from "react";


export default () => {

    useEffect(() => {
        const unSub = getAuth().onAuthStateChanged((firebaseUser) => {
            if(!firebaseUser) router.replace("/Login")
        })
        unSub()
    }, [])

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{headerShown:false, animation:"none"}} />
        </>
    )
}