import { View } from 'react-native';

type SpacerProps = {
  width?:  number;
  height?: number; // changed to string | number for consistency
};

const Spacer: React.FC<SpacerProps> = ({ width = 100, height = 40 }) => {
  return <View style={{ width, height }} />;
};

export default Spacer;
