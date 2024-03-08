import { Stack } from "expo-router";
import { colors } from "../../../helpers/theme";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: colors.white },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Poppins",
          fontSize: 24,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Diary",
        }}
      />
      <Stack.Screen
        name="foodLog"
        options={{
          headerTitle: "Food Diary",
        }}
      />
      <Stack.Screen
        name="searchFood"
        options={{
          headerTitle: "Food Log",
        }}
      />
      <Stack.Screen
        name="nutrition"
        options={{
          headerTitle: "Nutrition",
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
    </Stack>
  );
}
