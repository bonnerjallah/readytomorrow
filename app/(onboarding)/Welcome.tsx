import { useState, useRef } from 'react';
import { Dimensions, StyleSheet, Touchable, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { ArrowRight } from 'lucide-react-native';

import { onboarding, Onboarding } from '../../constant/indexOnboarding';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish?: () => void; // optional callback
}

export default function WelcomeScreen({ onFinish }: Props) {
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === onboarding.length - 1;

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.scrollBy) {
      swiperRef.current.scrollBy(1);
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('seenOnboarding', 'true');
    router.replace('../(auth)/Login');
    if (onFinish) onFinish();
  };

  return (
    <ThemedView style={{ flex: 1 }} safe>

        <TouchableOpacity style={styles.skipBtn}>
            <ThemedText style={{fontSize: 25, fontFamily: "bold"}} onPress={handleFinish}>Skip</ThemedText>
        </TouchableOpacity>


      <Swiper
        ref={swiperRef}
        loop={false}
        showsButtons={false}
        onIndexChanged={setCurrentIndex}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={{ bottom: 50 }}
      >
        {onboarding.map((item: Onboarding) => (
            <View style={styles.slide} key={item.id}>
                <View style={styles.imageWrapper}>
                <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={{ width: width * 0.8, height: height * 0.5 }}
                />
                </View>
                <ThemedText variant="heading" style={styles.title}>
                    {item.title}
                </ThemedText>
                <ThemedText variant="subtitle" style={{textAlign:"center", marginTop: 10}}>{item.description}</ThemedText>
            </View>
        ))}
      </Swiper>

        <ThemedButton
            style={styles.arrowRightStyle}
            onPress={isLastSlide ? handleFinish : handleNext}
            >
            {isLastSlide ? (
                <ThemedText variant="button">Get Started</ThemedText>
            ) : (
                <ArrowRight size={48} color="#fff" />
            )}
        </ThemedButton>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
    skipBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        borderBottomWidth: 1
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        marginTop: 30,
        width: width,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    imageWrapper: {
        width: '100%',
        height: height * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginTop: -50,
        textAlign: 'center',
    },
    dot: {
        backgroundColor: '#ccc',
        width: 10,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#000',
        width: 25,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 3,
    },
    arrowRightStyle: {
        position: 'absolute',
        bottom: 130,
        alignSelf: 'center',
        width: 250,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00cddb',
        zIndex: 10,
    },
});
