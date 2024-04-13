import { router, Stack } from "expo-router";
import { colors } from "../../../helpers/theme";
import { AntDesign } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useState, useEffect } from "react";
import useDecode from "../../../hooks/useDecode";

export default function Layout() {
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        const user = response?.user;
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);
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
            <>
              {currentUser?.role !== "trainer" && (
                <TouchableRipple
                  onPress={() => router.push("/home/edit")}
                  style={{ borderRadius: 100, padding: 5 }}
                  borderless
                >
                  <AntDesign name="edit" size={24} color="black" />
                </TouchableRipple>
              )}
            </>
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
