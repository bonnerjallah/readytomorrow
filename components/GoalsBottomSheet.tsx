// components/GoalsBottomSheet.tsx
import React, { ReactNode, useRef } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ThemedView from "./ThemedView";
import ThemedText from "./ThemedText";

type Props = {
  children: ReactNode;
  snapPoints?: string[];
  index?: number;
};

const GoalsBottomSheet = ({ children, snapPoints = ["25%", "50%"], index = 0 }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <ThemedView style={styles.container} safe>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={index}>
        <BottomSheetScrollView>
          <ThemedView>{children}</ThemedView>
        </BottomSheetScrollView>
      </BottomSheet>
    </ThemedView>
  );
};

export default GoalsBottomSheet;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
