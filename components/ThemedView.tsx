import React, { ReactNode } from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from './ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ThemedViewProps = {
  style?: StyleProp<ViewStyle>;
  safe?: boolean;
  padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  children?: ReactNode;
} & React.ComponentProps<typeof View>;

const ThemedView = ({ style, safe = false, children, ...props } : ThemedViewProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const renderChildren = React.Children.map(children, child =>
    typeof child === 'string' ? <Text style={{ color: theme.text }}>{child}</Text> : child
  );

  const baseStyle = {
    flex: 1, // <-- ensure it fills parent height
    backgroundColor: theme.background,
  };

  const safeStyle = {
    flex: 1, // <-- again, fill parent
    backgroundColor: theme.background,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: 10,
    paddingRight: 10,
  };

  if(!safe) return (
    <View 
      style = {[baseStyle, style]}
      {...props}
    >
      {renderChildren}
    </View>
  );

  return (
    <View
      style={[safeStyle, style]}
      {...props}
    >
      {renderChildren}
    </View>
  );
};


export default ThemedView;
