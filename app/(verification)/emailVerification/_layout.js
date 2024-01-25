import { Stack, useNavigation } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useEffect } from "react";
export default () => {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      navigation.navigate("(auth)", { screen: "login" });
    }
  }, [user, navigation]);

  return <Stack screenOptions={{ headerShown: false }} />;
};
