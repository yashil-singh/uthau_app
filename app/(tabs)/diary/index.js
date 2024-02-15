import { StyleSheet, Text, View } from "react-native";
import React from "react";
import OptionsContainer from "../../../components/OptionsContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../../helpers/theme";
import { useRouter } from "expo-router";
import MainContainer from "../../../components/MainContainer";

const index = () => {
  const router = useRouter();
  return (
    <MainContainer padding={15} gap={10}>
      <OptionsContainer
        title="Food Log"
        color={colors.warning.normal}
        desc="Search and log from thousands of food varieties."
        onPress={() => router.push("diary/foodLog")}
      >
        <MaterialCommunityIcons
          name="food-apple-outline"
          size={30}
          color="white"
        />
      </OptionsContainer>

      <OptionsContainer
        title="Exercises"
        color={colors.info.dark}
        desc="Find your saved exercises here."
        onPress={() => router.push("diary/exercises")}
      >
        <MaterialCommunityIcons name="weight-lifter" size={30} color="white" />
      </OptionsContainer>
      <OptionsContainer
        title="Recipes"
        color={colors.orange.normal}
        desc="Find your saved recipes here."
        onPress={() => router.push("diary/recipes")}
      >
        <MaterialIcons name="my-library-books" size={30} color="white" />
      </OptionsContainer>
    </MainContainer>
  );
};

export default index;

const styles = StyleSheet.create({});
