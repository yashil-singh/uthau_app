import { Stack, useNavigation } from "expo-router";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect } from "react";
import { Text } from "react-native";
import { View } from "react-native-web";

export default function Layout() {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      if (user.isVerified) {
        navigation.navigate("(tabs)", { screen: "home" });
      } else {
        navigation.navigate("(verification)", { screen: "emailVerification" });
      }
    }
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins",
        },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen
        name="aboutYou"
        options={{
          headerTitle: "About You",
        }}
      />
      <Stack.Screen
        name="accountCreated"
        options={{
          headerTitle: "Account Created",
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{
          headerTitle: "Forgot Password",
        }}
      />
      <Stack.Screen
        name="resetCode"
        options={{
          headerTitle: "Reset Code",
        }}
      />
      <Stack.Screen
        name="resetPassword"
        options={{
          headerTitle: "Reset Password",
        }}
      />
    </Stack>
  );
}
