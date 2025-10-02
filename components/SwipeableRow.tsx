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
import React, { forwardRef, useImperativeHandle } from "react";


type SwipeableRowType = {
  id: string | number;
  onDelete: (id: string | number) => void;
  children: React.ReactNode;
};

const SwipeableRow = (
  { id, onDelete, children }: SwipeableRowType,
  ref: React.Ref<{ resetSwipe: () => void }>
) => {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -100;

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // optional: could lock gesture if vertical
    })
    .onUpdate((e) => {
      // Only move left
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        translateX.value = Math.min(0, e.translationX);
      }
    })
    .onEnd((e) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-300, { duration: 200 }, () => {
          runOnJS(onDelete)(id);
        });
      } else {
        translateX.value = withTiming(0);
      }
    })
    .hitSlop({ left: 0, right: 0, top: 5, bottom: 5 }); // small hitSlop to improve scrolling

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

  // Expose a reset function
  useImperativeHandle(ref, () => ({
    resetSwipe: () => {
      translateX.value = withTiming(0);
    },
  }));

  return (
    <View style={{ marginBottom: 10, borderRadius: 10, overflow: "hidden" }}>
      {/* Trash background */}
      <Animated.View style={[styles.trashBackground, trashStyle]}>
        <Trash2 size={30} stroke="white" />
      </Animated.View>

      {/* Swipeable foreground */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

export default forwardRef(SwipeableRow);

const styles = StyleSheet.create({
  trashBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    backgroundColor:"red"
  },
});
