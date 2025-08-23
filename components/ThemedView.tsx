import React, { ReactNode } from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from './ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ThemedViewProps = {
  style?: StyleProp<ViewStyle>;
  safe?: boolean;
  children?: ReactNode;
} & React.ComponentProps<typeof View>;

const ThemedView: React.FC<ThemedViewProps> = ({ style, safe = false, children, ...props }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const renderChildren = React.Children.map(children, child =>
    typeof child === 'string' ? <Text style={{ color: theme.text }}>{child}</Text> : child
  );

  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...props}
    >
      {renderChildren}
    </View>
  );
};

export default ThemedView;
