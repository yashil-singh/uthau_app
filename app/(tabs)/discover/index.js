import { StyleSheet, Text, View } from "react-native";
import React from "react";
import OptionsContainer from "../../../components/OptionsContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../../helpers/theme";
import { useRouter } from "expo-router";

const index = () => {
  const router = useRouter();

  return (
    <View
      style={{
        padding: 15,
        flex: 1,
        backgroundColor: colors.white,
        gap: 10,
      }}
    >
      <OptionsContainer
        title="Exercises"
        color={colors.info.dark}
        desc="Search from a collection of exercises here."
        onPress={() => router.push("discover/exercises")}
      >
        <MaterialCommunityIcons name="weight-lifter" size={35} color="white" />
      </OptionsContainer>

      <OptionsContainer
        title="Recipes"
        color={colors.orange.normal}
        desc="Search from a collection of recipes here."
        onPress={() => router.push("discover/recipes")}
      >
        <MaterialIcons name="my-library-books" size={35} color="white" />
      </OptionsContainer>

      <OptionsContainer
        title="Find Partner"
        color={colors.secondary.normal}
        desc="Search for gym partners to get gains together."
      >
        <MaterialIcons name="person-search" size={35} color="white" />
      </OptionsContainer>

      <OptionsContainer
        title="AR Buddies"
        color={colors.error.normal}
        desc="Complete goals and find your AR buddies here."
      >
        <MaterialIcons name="videogame-asset" size={35} color="white" />
      </OptionsContainer>
    </View>
  );
};

export default index;
