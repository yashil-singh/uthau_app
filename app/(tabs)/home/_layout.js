import { router, Stack } from "expo-router";
import { colors } from "../../../helpers/theme";
import { AntDesign } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";

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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerTitle: "Profile",
          headerRight: () => (
            <TouchableRipple
              onPress={() => router.push("/home/edit")}
              style={{ borderRadius: 100, padding: 5 }}
              borderless
            >
              <AntDesign name="edit" size={24} color="black" />
            </TouchableRipple>
          ),
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerTitle: "Edit Profile",
        }}
      />
    </Stack>
  );
}
