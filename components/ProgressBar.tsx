import React from "react";
import { Svg, Polygon } from "react-native-svg";

type ProgressBarProps = {
  width: number;
  height: number;
  progress: number; // 0 to 1
};

const ProgressBar: React.FC<ProgressBarProps> = ({ width, height, progress }) => {
  // Calculate polygon points for a horizontal bar
  const filledWidth = width * Math.min(Math.max(progress, 0), 1); // clamp 0-1
  const points = `0,0 ${filledWidth},0 ${filledWidth},${height} 0,${height}`;

  return (
    <Svg width={width} height={height}>
      {/* Background */}
      <Polygon points={`0,0 ${width},0 ${width},${height} 0,${height}`} fill="#ddd" />
      {/* Filled progress */}
      <Polygon points={points} fill="#34a0a4" />
    </Svg>
  );
};

export default ProgressBar;
