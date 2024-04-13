import { Stack } from "expo-router";
import { colors } from "../../../../helpers/theme";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins",
          fontSize: 24,
        },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "ARScan",
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          headerTitle: "Find",
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
