import React, { ReactNode, useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "./ThemeContext";

type ThemedTextInputProps = TextInputProps & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode; 
  placeholderTextColor?: string; 
};

const ThemedTextInput = ({
  style,
  children,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) => {
  const { theme } = useTheme();
  const [height, setHeight] = useState(40); // base height

  return (
    <View style={[styles.inputWrapper, style]}>
      {children && <View style={{ marginRight: 8 }}>{children}</View>}
      <TextInput
        style={[
          styles.input,
          { color: theme.text, height: Math.max(40, height) },
        ]}
        placeholderTextColor={placeholderTextColor || theme.placeholder}
        multiline
        onContentSizeChange={(e) => {
          setHeight(e.nativeEvent.contentSize.height); // expands + shrinks
        }}
        {...props}
      />
    </View>
  );
};

export default ThemedTextInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top", // makes multiline text start from top
  },
});
