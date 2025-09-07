import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

// 🔤 Types
type PercentageCircleType = {
  percent: number; // 0-100
  radius?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
};

const PercentageCircle = ({percent, radius = 30, strokeWidth = 8, color = "#3498db", bgColor = "#e0e0e0"}: PercentageCircleType) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: radius * 2, height: radius * 2 }}>
      <Svg height={radius * 2} width={radius * 2}>
        {/* Background circle */}
        <Circle
          stroke={bgColor}
          fill="transparent"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke={color}
          fill="transparent"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Percent label */}
      <View style={styles.label}>
        <Text style={styles.text}>{percent}%</Text>
      </View>
    </View>
  );
};

export default PercentageCircle;

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
