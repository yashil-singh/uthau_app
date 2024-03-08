import { Stack } from "expo-router";
import { colors } from "../../../../helpers/theme";
export default () => {
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
          headerTitle: "Friends",
        }}
      />
      <Stack.Screen
        name="find"
        options={{
          headerTitle: "Add Friends",
        }}
      />
    </Stack>
  );
};
