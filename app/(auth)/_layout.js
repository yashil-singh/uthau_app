import { Stack, useNavigation } from "expo-router";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect } from "react";
import { RegisterContextProvider } from "../../context/RegisterContext";
import decodeToken from "../../helpers/decodeToken";

export default function Layout() {
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const userDetails = decodedToken?.user;

  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      if (userDetails?.isverified) {
        navigation.navigate("(tabs)", { screen: "home" });
      } else {
        navigation.navigate("(verification)", { screen: "emailVerification" });
      }
    }
  }, [user]);

  return (
    <RegisterContextProvider>
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
          name="about"
          options={{
            headerTitle: "About You",
          }}
        />
        <Stack.Screen
          name="goal"
          options={{
            headerTitle: "Goals",
          }}
        />
        <Stack.Screen
          name="confirmation"
          options={{
            headerTitle: "Confirmation",
          }}
        />
        <Stack.Screen
          name="accountCreated"
          options={{
            headerShown: false,
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
    </RegisterContextProvider>
  );
}
