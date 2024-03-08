import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AccountContainer from "../../../components/AccountContainer";
import { useLogout } from "../../../hooks/useLogout";
import { colors } from "../../../helpers/theme";

export default function Layout() {
  const { logout } = useLogout();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
          headerLeft: () => {
            return <AccountContainer size={40} onPress={logout} />;
          },
          headerRight: () => {
            return (
              <Ionicons name="ios-notifications" size={30} color="black" />
            );
          },
        }}
      />
    </Stack>
  );
}
