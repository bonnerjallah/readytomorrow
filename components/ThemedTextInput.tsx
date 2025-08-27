import React, { ReactNode } from 'react';
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from './ThemeContext';

// Define the type for the props
type ThemedTextInputProps = TextInputProps & {
  style?: StyleProp<ViewStyle>; 
  children?: ReactNode;          // for icons/buttons inside input
  placeholderTextColor?: string; // match React Native naming
};

const ThemedTextInput = ({
  style,
  children,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.inputWrapper, { flexDirection: "row", alignItems: "center" }, style]}>
      {children && <View style={{ marginRight: 8 }}>{children}</View>}
      <TextInput
        style={[styles.input, { color: theme.text, flex: 1 }]}
        placeholderTextColor={placeholderTextColor || theme.placeholder}
        {...props}
      />
    </View>
  );
};


export default ThemedTextInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
