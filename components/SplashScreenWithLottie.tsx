import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

// Get device screen width
const { width, height } = Dimensions.get("window");
const SIZE = width * 1;
const ANIMATION_HEIGHT = height * 1;

// Define props interface
interface SplashScreenWithLottieProps {
  onAnimationEnd: () => void; // Function type with no parameters and no return
}

export default function SplashScreenWithLottie({ onAnimationEnd }: SplashScreenWithLottieProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/splash.json')} // Your .json file
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationEnd}
        style={{ width: SIZE, height: ANIMATION_HEIGHT }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
