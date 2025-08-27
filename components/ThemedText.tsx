import React, { ReactNode } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { Typography } from '../constant/Typography';

type ThemedTextProps = TextProps & {
  style?: StyleProp<TextStyle>;
  title?: boolean;
  variant?: keyof typeof Typography;
  children?: ReactNode;
};

const ThemedText = ({
  style,
  title = false,
  variant = 'body',
  children,
  ...props
 } : ThemedTextProps) => {

  const { theme } = useTheme();
    
  const textColor = title ? theme.title : theme.text;
  const fontStyle = Typography[variant] ?? Typography.body;

  return (
    <Text style={[{ color: textColor }, fontStyle, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemedText;
