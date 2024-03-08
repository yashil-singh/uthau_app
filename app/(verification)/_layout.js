import { Stack, useNavigation } from "expo-router";
import { colors } from "../../helpers/theme";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect } from "react";

export default function Layout() {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      navigation.navigate("(auth)", { screen: "login" });
    } else {
      if (user.isVerified) {
        navigation.navigate("(tabs)", { screen: "home" });
      }
    }
  }, [user, navigation]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Email Verification",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.white },
        headerTitleStyle: {
          fontFamily: "Poppins",
        },
      }}
    />
  );
}
