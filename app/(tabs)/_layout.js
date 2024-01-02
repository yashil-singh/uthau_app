import { Tabs, useNavigation, useRouter } from "expo-router";
import { colors } from "../../helpers/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function _layout() {
  const { user } = useAuthContext();
  const email = user.email;
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      navigation.navigate("(auth)", { screen: "login" });
    } else {
      if (!user.isVerified) {
        navigation.navigate("(verification)", {
          screen: "emailVerification",
          params: {
            email: email,
          },
        });
      }
    }
  }, [user, navigation]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.normal,
        tabBarStyle: {
          borderWidth: 1,
          borderColor: "#e3e3e3",
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons
                name="ios-home-sharp"
                size={24}
                color={colors.primary.normal}
              />
            ) : (
              <Ionicons
                name="ios-home-outline"
                size={24}
                color={colors.primary.normal}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          tabBarLabel: "Diary",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="book" size={24} color={colors.primary.normal} />
            ) : (
              <Ionicons
                name="book-outline"
                size={24}
                color={colors.primary.normal}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: "Discover",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons
                name="compass"
                size={24}
                color={colors.primary.normal}
              />
            ) : (
              <Ionicons
                name="compass-outline"
                size={24}
                color={colors.primary.normal}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          tabBarLabel: "Gym",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons
                name="arm-flex"
                size={25}
                color={colors.primary.normal}
              />
            ) : (
              <MaterialCommunityIcons
                name="arm-flex-outline"
                size={25}
                color={colors.primary.normal}
              />
            ),
        }}
      />
    </Tabs>
  );
}