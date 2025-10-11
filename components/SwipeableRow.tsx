// SwipeableRow.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Trash2 } from "lucide-react-native";

type SwipeableRowType = {
  id: string | number;
  onDelete: (id: string | number) => void;
  children: React.ReactNode;
};

const SwipeableRow = forwardRef(function SwipeableRow(
  { id, onDelete, children }: SwipeableRowType,
  ref: React.Ref<{ resetSwipe: () => void }>
) {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -100;
  const MAX_SWIPE = -120;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) translateX.value = Math.max(e.translationX, -150);
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(MAX_SWIPE, { duration: 200 }, () => {
          runOnJS(onDelete)(id);
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  useImperativeHandle(ref, () => ({
    resetSwipe: () => {
      translateX.value = withTiming(0, { duration: 200 });
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trashStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.trashBackground, trashStyle]}>
        <Trash2 size={26} stroke="white" />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeable, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

export default SwipeableRow;

const styles = StyleSheet.create({
  container: { marginBottom: 10, borderRadius: 10, overflow: "hidden" },
  swipeable: { alignItems: "center"},
  trashBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    backgroundColor: "red",
  },
});
