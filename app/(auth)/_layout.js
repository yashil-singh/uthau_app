import { Stack, useNavigation } from "expo-router";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect } from "react";
import { RegisterContextProvider } from "../../context/RegisterContext";
import useDecode from "../../hooks/useDecode";

export default function Layout() {
  const { user } = useAuthContext();

  let userDetails;

  const { getDecodedToken } = useDecode();

  useEffect(() => {
    const fetchDecodedToken = async () => {
      if (user) {
        const response = await getDecodedToken();
        if (response.success) {
          const userDetails = response.user;
          if (userDetails?.isverified) {
            navigation.navigate("(tabs)", { screen: "home" });
          } else {
            navigation.navigate("(verification)", {
              screen: "emailVerification",
            });
          }
        }
      }
    };

    fetchDecodedToken();
  }, [user, userDetails]);

  const navigation = useNavigation();

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
