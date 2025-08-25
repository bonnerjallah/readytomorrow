// 🌱 CORE IMPORTS
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
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";


// 🎨 UI
import ThemedView from "components/ThemedView";
import ThemedText from "components/ThemedText";
import ThemedButton from "components/ThemedButton";
import Spacer from "components/Spacer";
import ThemedTextInput from "components/ThemedTextInput";
import { Mail, LockKeyholeOpen } from "lucide-react-native";

// ⚛️ STATE MANAGEMENT
import { useTheme } from "components/ThemeContext";
import { useSetAtom } from "jotai";
import { userAtom } from "atoms/userAtoms";

// 💾 Firebase
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig"; 
import { setDoc, getDoc, doc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
  

// 🔤 TYPES
type Screen = "login" | "register" | "resetRequest" | "checkEmail";


const AuthFlow = () => {

  const { theme } = useTheme();

  const [screen, setScreen] = useState<Screen>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPwd, setConfPwd] = useState("")
  const [loading, setLoading] = useState(false);  
  const [errmsg, setErrMsg] = useState("")

  const setUser = useSetAtom(userAtom)


  // 🔹SHOW ERROR MESSAGE
  const showError = (msg: string) => {
    setErrMsg(msg)
    setTimeout(() => setErrMsg(""),3000)
  }

  // 🔹 REGISTER HANDLER 🔹
  const handleRegisterSubmit = async () => {

    setLoading(true)

    if(password !== confPwd) {
      setErrMsg("Password do not match")
      setTimeout(() => setErrMsg(""),3000)
      setLoading(false)
      return;
    }

    const trimedEmail = email.trim();
    const trimedPwd = password.trim();

    try {

      const response = await createUserWithEmailAndPassword(
        auth,
        trimedEmail,
        trimedPwd
      )

      await sendEmailVerification(response.user)

      await setDoc(doc(db, "users", response.user.uid), {
        email: trimedEmail,
        role: "user",
        createdAt : new Date()
      })

      setScreen("checkEmail");

    } catch (error) {
      console.log("Error registering user", error)
      let msg = "An error occurred.";
      if (error instanceof FirebaseError) {
        const messages: Record<string, string> = {
          "auth/email-already-in-use": "Email already in use.",
          "auth/invalid-email": "Invalid email address.",
          "auth/weak-password": "Password must be at least 6 characters.",
        };
        msg = messages[error.code] ?? error.message;
      }
      showError(msg);

    } finally {
      setLoading(false)
    }
  }

  // 🔹 LOGIN HANDLER
  const handleLoginIn = async () => {
    setLoading(true);

    if (!email || !password) {
      setErrMsg("Email and password required");
      setTimeout(() => setErrMsg(""), 3000);
      setLoading(false);
      return;
    }

    const trimedEmail = email.trim();
    const trimedPwd = password.trim();

    try {
      const response = await signInWithEmailAndPassword(auth, trimedEmail, trimedPwd);
      const userData = response.user;

      if (!userData?.uid) {
        showError("Something went wrong. Please try again");
        setLoading(false);
        return;
      }

      if (!userData.emailVerified) {
        showError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userData.uid));

      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUser({
          id: userData.uid,
          email: userData.email ?? null,
          createdAt: profileData.createdAt.toDate(),
          ...profileData,
        });
      } else {
        console.log("User profile not found in Firestore");

        setUser({
          id: userData.uid,
          email: userData.email,
          createdAt: new Date(),
        });
      }

      // Clear login fields
      setEmail("");
      setPassword("");

      // Redirect to dashboard
      router.replace("(dashboard)/Home");

    } catch (error) {
      console.log("Error logging in", error);
      let msg = "Invalid login credentials.";
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credentials") {
          msg = "Invalid email or password";
        }
      }
      showError(msg);
    } finally {
      setLoading(false);
    }
  };


  // 🔹 PASSWORD RESET HANDLER
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

            {errmsg !== "" && (
              <ThemedText style={{ color: "red", textAlign: "center", marginTop: 20 }}>
                {errmsg}
              </ThemedText>
            )}

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

                <ThemedButton 
                  style={[styles.bttn, { width: 250, height: 50, alignSelf: "center" }]}
                  onPress={handleLoginIn}
                >
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
                    value={confPwd}
                    onChangeText={setConfPwd}
                  >
                    <LockKeyholeOpen />
                  </ThemedTextInput>
                </View>

                <Spacer height={50} />

                <ThemedButton 
                  style={[styles.bttn, { width: 250, height: 50, alignSelf: "center" }]}
                  onPress={handleRegisterSubmit}
                >
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
                  Reset Password
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
                  Verify Your Email
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
