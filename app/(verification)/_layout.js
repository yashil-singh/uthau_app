import { Stack, useFocusEffect, useNavigation } from "expo-router";
import { colors } from "../../helpers/theme";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect, useState } from "react";
import useDecode from "../../hooks/useDecode";

export default function Layout() {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  const { getDecodedToken } = useDecode();

  useEffect(() => {}, []);

  useFocusEffect(() => {
    const fetchDecodedToken = async () => {
      if (!user) {
        navigation.navigate("(auth)", { screen: "login" });
      } else {
        const response = await getDecodedToken();
        console.log("🚀 ~ response:", response);

        if (response.success) {
          const currentUser = response?.user;
          if (currentUser?.isverified) {
            navigation.navigate("(tabs)", { screen: "home" });
          }
        } else {
          navigation.navigate("(auth)", { screen: "login" });
        }
      }
    };

    fetchDecodedToken();
  });

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
