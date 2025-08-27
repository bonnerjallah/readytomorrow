import React, { ReactNode } from 'react';
import { Pressable, PressableProps, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from './ThemeContext';

type ThemedButtonProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode; // can be text or components
  textStyle?: StyleProp<TextStyle>;
};

const ThemedButton = ({ style, children, textStyle, ...props }: ThemedButtonProps) => {
  const { theme } = useTheme();

  const renderContent = () => {
    if (typeof children === 'string') {
      return (
        <Text style={[{ color: theme.buttontitle, textAlign: 'center', fontWeight: 'bold' }, textStyle]}>
          {children}
        </Text>
      );
    }
    return children; // React component, like an icon
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: theme.primary,
          padding: 12,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.6 : 1,
          width: "50%",
          height:50
        },
        style,
      ]}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
};

export default ThemedButton;
