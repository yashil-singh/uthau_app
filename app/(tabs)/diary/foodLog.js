import { View, ScrollView } from "react-native";
import React from "react";
import MainContainer from "../../../components/MainContainer";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HeaderText, SubHeaderText } from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import CircularProgress from "react-native-circular-progress-indicator";
import MealTable from "../../../components/MealTable";
import StyledButton from "../../../components/StyledButton";
import { useRouter } from "expo-router";
import DateNavigator from "../../../components/DateNavigator";

const foodLog = () => {
  const router = useRouter();

  const foodLogs = [
    { id: "1", mealType: "Breakfast", food: ["Hard boiled egg"] },
    { id: "2", mealType: "Lunch", food: "Chicken Salad" },
    { id: "3", mealType: "Snacks", food: "Apple" },
    { id: "4", mealType: "Dinner", food: "Grilled Salmon" },
    // Add more food logs as needed
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <MainContainer>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 25,
            gap: 25,
          }}
        >
          <DateNavigator />
          <SubHeaderText style={{ fontSize: 20, textAlign: "center" }}>
            You have consumed {"\n"}{" "}
            <SubHeaderText style={{ color: colors.warning.normal }}>
              1,110
            </SubHeaderText>{" "}
            cals today.
          </SubHeaderText>
          <View>
            <CircularProgress
              value={1440}
              maxValue={2550}
              radius={100}
              activeStrokeColor={colors.primary.normal}
              inActiveStrokeColor={colors.primary.dark}
              inActiveStrokeOpacity={0.2}
              inActiveStrokeWidth={15}
              activeStrokeWidth={20}
              title="Remaining"
              titleColor={colors.black}
              titleStyle={{
                color: "gray",
                fontSize: 16,
                fontFamily: "Figtree",
              }}
              progressValueStyle={{
                color: colors.black,
                fontSize: 30,
                fontFamily: "Poppins-Bold",
              }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather
              name="target"
              size={30}
              color="red"
              style={{ paddingBottom: 5 }}
            />
            <HeaderText style={{ fontSize: 24 }}>Daily Goal: 2,550</HeaderText>
          </View>
          <MealTable foodLogs={foodLogs} mealType={"Breakfast"} />
          <MealTable foodLogs={foodLogs} mealType={"Lunch"} />
          <MealTable foodLogs={foodLogs} mealType={"Snacks"} />
          <MealTable foodLogs={foodLogs} mealType={"Dinner"} />
        </View>
        <StyledButton
          title="Nutrition"
          onPress={() => router.push("/diary/nutrition")}
        >
          <MaterialCommunityIcons name="nutrition" size={25} color="white" />
        </StyledButton>
      </MainContainer>
    </ScrollView>
  );
};

export default foodLog;
