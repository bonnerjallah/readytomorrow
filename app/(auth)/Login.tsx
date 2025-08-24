import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // adjust path
import ThemedView from "components/ThemedView";
import ThemedText from "components/ThemedText";
import ThemedButton from "components/ThemedButton";
import Spacer from "components/Spacer";
import ThemedTextInput from "components/ThemedTextInput";
import { Mail, LockKeyholeOpen } from "lucide-react-native";
import { useTheme } from "components/ThemeContext";

type Screen = "login" | "register" | "resetRequest" | "checkEmail";

const AuthFlow = () => {
  const { theme } = useTheme();
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert("Email required");

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setScreen("checkEmail");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 1 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.root}>
            <ImageBackground
              source={require("../../assets/images/background.png")}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <StatusBar translucent backgroundColor="transparent" style="light" />

            <ThemedView style={[styles.container, { backgroundColor: "transparent" }]} safe>
              <Image
                source={require("../../assets/images/logolight.png")}
                style={{ width: 220, height: 120, alignSelf: "center", marginTop: 70 }}
              />
              <Spacer height={20} />

              {screen === "login" && (
                <>
                  <ThemedText
                    style={{ textAlign: "center", marginTop: 120, color: theme.primary }}
                    variant="title"
                  >
                    Sign in to continue
                  </ThemedText>

                  <Spacer height={20} />

                  <View style={{ width: "95%", alignSelf: "center" }}>
                    <ThemedTextInput
                      placeholder="Email"
                      style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    >
                      <Mail size={20} />
                    </ThemedTextInput>

                    <Spacer height={30} />

                    <ThemedTextInput
                      placeholder="Password"
                      style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    >
                      <LockKeyholeOpen />
                    </ThemedTextInput>

                    <Spacer height={10} />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 }}>
                      <TouchableOpacity onPress={() => setScreen("resetRequest")}>
                        <ThemedText style={{ fontSize: 15, marginTop: 5, color: "white" }}>
                          Forgot Password?
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setScreen("register")}>
                        <ThemedText style={{ fontSize: 15, marginTop: 5, color: "white" }}>
                          Sign Up
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Spacer height={70} />

                  <ThemedButton style={[styles.bttn, { width: 250, height: 50, alignSelf: "center" }]}>
                    <ThemedText style={{ color: theme.buttontitle }}>Sign In</ThemedText>
                  </ThemedButton>
                </>
              )}

              {screen === "register" && (
                <>
                  <ThemedText
                    style={{ textAlign: "center", marginTop: 120, color: theme.primary }}
                    variant="title"
                  >
                    Create your account
                  </ThemedText>

                  <Spacer height={20} />

                  <View style={{ width: "95%", alignSelf: "center" }}>
                    <ThemedTextInput
                      placeholder="Email"
                      style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    >
                      <Mail size={20} />
                    </ThemedTextInput>

                    <Spacer height={20} />

                    <ThemedTextInput
                      placeholder="Password"
                      style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    >
                      <LockKeyholeOpen />
                    </ThemedTextInput>

                    <Spacer height={20} />

                    <ThemedTextInput
                      placeholder="Confirm Password"
                      style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                      secureTextEntry
                    >
                      <LockKeyholeOpen />
                    </ThemedTextInput>
                  </View>

                  <Spacer height={50} />

                  <ThemedButton style={[styles.bttn, { width: 250, height: 50, alignSelf: "center" }]}>
                    <ThemedText style={{ color: theme.buttontitle }}>Register</ThemedText>
                  </ThemedButton>

                  <Spacer height={20} />

                  <TouchableOpacity onPress={() => setScreen("login")}>
                    <ThemedText style={{ fontSize: 15, marginTop: 5, color: "white", textAlign: "center" }}>
                      Back to Login
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}

              {screen === "resetRequest" && (
                <>
                  <ThemedText
                    style={{ textAlign: "center", marginTop: 120, color: theme.primary }}
                    variant="title"
                  >
                    Forgot Password?
                  </ThemedText>

                  <Spacer height={20} />

                  <ThemedTextInput
                    placeholder="Enter your email"
                    style={[styles.inputStyle, { backgroundColor: theme.inputBackground }]}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <Spacer height={20} />

                  <ThemedButton onPress={handleReset} disabled={loading} style={{ alignSelf: "center", marginTop: 15 }}>
                    <ThemedText style={{ color: theme.buttontitle }}>
                      {loading ? "Sending..." : "Send Reset Email"}
                    </ThemedText>
                  </ThemedButton>

                  <Spacer height={20} />

                  <TouchableOpacity onPress={() => setScreen("login")}>
                    <ThemedText style={{ color: "white", textAlign: "center", fontSize: 15 }}>
                      Back to Login
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}

              {screen === "checkEmail" && (
                <>
                  <ThemedText
                    style={{ textAlign: "center", marginTop: 120, color: theme.primary }}
                    variant="title"
                  >
                    Check Your Email
                  </ThemedText>

                  <Spacer height={20} />

                  <ThemedText style={{ textAlign: "center", marginVertical: 10 }}>
                    We’ve sent you a password reset link. After updating your password, return here and tap the button below to continue.
                  </ThemedText>

                  <Spacer height={30} />

                  <ThemedButton onPress={() => setScreen("login")} style={{ alignSelf: "center" }}>
                    <ThemedText style={{ color: theme.buttontitle, textAlign: "center" }}>Back to Login</ThemedText>
                  </ThemedButton>
                </>
              )}
            </ThemedView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AuthFlow;

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  inputStyle: {
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bttn: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
