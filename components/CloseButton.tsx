// CloseButton.tsx
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { CircleX } from 'lucide-react-native';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const CloseButton = ({ onPress, style }: Props) => {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
    >
      <CircleX size={40} stroke="#77d1d2ff" />
    </TouchableOpacity>
  );
};

export default CloseButton;
