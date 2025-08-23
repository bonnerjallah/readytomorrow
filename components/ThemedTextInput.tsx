import React, { ReactNode } from 'react';
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from './ThemeContext';

// Define the type for the props
type ThemedTextInputProps = TextInputProps & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  placeHolderTextColor?: string;
};

// ThemedTextInput component
const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  style,
  children,
  placeHolderTextColor,
  ...props
}) => {
    
  const { theme } = useTheme();

  return (
    <View>
      {children && <View style={[styles.inputWrapper, style]}>{children}</View>}
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholderTextColor={placeHolderTextColor || theme.placeholder}
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
