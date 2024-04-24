import { Stack } from "expo-router";
import { colors } from "../../../helpers/theme";

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
          headerTitle: "Discover",
        }}
      />
      <Stack.Screen
        name="exercises"
        options={{
          headerTitle: "Exercises",
        }}
      />
      <Stack.Screen
        name="recipes"
        options={{
          headerTitle: "Recipes",
        }}
      />
      <Stack.Screen
        name="partner"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="competition"
        options={{
          headerTitle: "Competitions",
        }}
      />
      <Stack.Screen
        name="ar"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
