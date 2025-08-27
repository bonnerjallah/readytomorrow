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

  if(!safe) return (
    <View 
      style = {[{backgroundColor: theme.background}, style]}
      {...props}
    />
  );

  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: 10,
          paddingRight: 10,
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
