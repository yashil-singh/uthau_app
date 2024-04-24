import { Tabs, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { colors } from "../../helpers/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useDecode from "../../hooks/useDecode";

export default function _layout() {
  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();

  useFocusEffect(() => {
    if (!user) {
      navigation.navigate("(auth)", { screen: "login" });
    }
  });

  useEffect(() => {
    const fetchDecodedToken = async () => {
      if (!user) {
        navigation.navigate("(auth)", { screen: "login" });
      } else {
        const response = await getDecodedToken();
        if (response.success) {
          const currentUser = response.user;

          if (!currentUser.isverified) {
            navigation.navigate("(verification)", {
              screen: "emailVerification",
              params: {
                email: currentUser?.email,
              },
            });
          }
        } else {
          navigation.navigate("(auth)", { screen: "login" });
        }
      }
    };

    fetchDecodedToken();
  }, [user]);

  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.normal,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          borderWidth: 1,
          borderColor: colors.lightGray,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins",
        },
        headerTitleAlign: "left",
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) =>
            focused ? (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ) : (
              <MaterialCommunityIcons
                name="home-outline"
                size={24}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          tabBarLabel: "Diary",
          headerShown: false,
          tabBarIcon: ({ focused, color }) =>
            focused ? (
              <Ionicons name="book" size={24} color={color} />
            ) : (
              <Ionicons name="book-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: "Discover",
          headerShown: false,
          tabBarIcon: ({ focused, color }) =>
            focused ? (
              <Ionicons name="compass" size={24} color={color} />
            ) : (
              <Ionicons name="compass-outline" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          tabBarLabel: "Gym",
          headerShown: false,
          tabBarIcon: ({ focused, color }) =>
            focused ? (
              <MaterialCommunityIcons name="arm-flex" size={25} color={color} />
            ) : (
              <MaterialCommunityIcons
                name="arm-flex-outline"
                size={25}
                color={color}
              />
            ),
        }}
      />
    </Tabs>
  );
}
