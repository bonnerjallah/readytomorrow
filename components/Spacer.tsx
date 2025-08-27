import { ReactNode } from 'react';
import { View } from 'react-native';

type SpacerProps = {
  width?:  number;
  height?: number; // changed to string | number for consistency
  children?: ReactNode
};

const Spacer = ({ width = 100, height = 40 } : SpacerProps) => {
  return <View style={{ width, height }} />;
};

export default Spacer;
