import { Stack } from "expo-router";
import AccountContainer from "../../../components/AccountContainer";
import { useLogout } from "../../../hooks/useLogout";
import { colors } from "../../../helpers/theme";

export default function Layout() {
  const { logout } = useLogout();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
