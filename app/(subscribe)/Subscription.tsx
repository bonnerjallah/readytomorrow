import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

import ThemedView from 'components/ThemedView'
import ThemedText from 'components/ThemedText'
import BackButton from 'components/BackButton'
import Spacer from 'components/Spacer'
import ThemedButton from 'components/ThemedButton'

type Props = {}

const Subscription = (props: Props) => {


    const premiumFeatures = [
        "Unlimited weekly objectives/activities",
        "Special themes or icons",
        "Analytics or progress tracking",
        "Offline access",
        "AI-powered suggestions or insights",
        "Priority customer support",
        "Custom reminders and notifications",
        
    ];

    const handleSubscribe = () => {
        // Implement your subscription logic here
        console.log("Subscribe button pressed");
    }

  return (
    <ThemedView style={{flex:1}} safe>
       <BackButton />

      <Spacer height={20} />

      <ThemedText variant="title" style={{ textAlign: 'center' }}>
        Subscription
      </ThemedText>

      <Spacer height={30} />

        <View style={{paddingHorizontal:20}}>
            <ThemedText variant="subtitle" style={{marginBottom:15, textAlign: 'center'}}>Upgrade to Premium to unlock the following features:</ThemedText>
            <Spacer height={10} />
            {premiumFeatures.map((feature, index) => (
                <View key={index} style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
                    <ThemedText style={{fontSize:18, marginRight:10}}>•</ThemedText>
                    <ThemedText style={{fontSize:18}}>{feature}</ThemedText>
                </View>
            ))}
        </View>

        <Spacer height={40} />

           
        <ThemedButton
            style={{
            alignItems: 'center',
            marginTop: 20,
            paddingVertical: 15,
            height: 100,
            width: '90%',
            alignSelf: 'center',
            borderRadius: 15,
            }}
            onPress={handleSubscribe}
        >
            <ThemedText variant="subtitle" style={{ marginBottom: 10 }}>
            Subscribe for $4.99/month
            </ThemedText>
            <ThemedText style={{ textDecorationLine: 'underline' }}>Subscribe Now</ThemedText>
        </ThemedButton>

            
       
      

      <Spacer height={25} />
    </ThemedView>
  )
}

export default Subscription

const styles = StyleSheet.create({})