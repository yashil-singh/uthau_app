import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { BodyText, SubHeaderText } from "./StyledText";
import { colors } from "../helpers/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MealTable = ({
  user_id,
  date,
  foodLogs,
  mealType,
  mealTotals,
  showAdd,
}) => {
  const router = useRouter();
  // Filter logs based on mealType
  const filteredLogs =
    foodLogs == null || foodLogs == undefined
      ? []
      : foodLogs.filter((log) => {
          return log.meal_type.toUpperCase() === mealType.toUpperCase();
        });
  const filteredMealTotals =
    mealTotals == null || mealTotals == undefined
      ? []
      : mealTotals.filter((t) => {
          return t.meal_type.toUpperCase() === mealType.toUpperCase();
        });
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SubHeaderText style={{ fontSize: 18 }}>{mealType}</SubHeaderText>

        {filteredMealTotals.map((item, index) => (
          <SubHeaderText
            style={{ color: colors.warning.normal, fontSize: 18 }}
            key={index}
          >
            {Math.round(item.total_calories)}
          </SubHeaderText>
        ))}
      </View>

      {filteredLogs.map((item, index) => (
        <TouchableOpacity style={styles.row} key={index} activeOpacity={0.8}>
          <View style={{ flex: 1, gap: 5 }}>
            <BodyText style={{ fontSize: 16 }}>{item.food_name}</BodyText>
            <BodyText style={{ color: colors.gray }}>
              Quantity: {item.quantity}{" "}
            </BodyText>
          </View>
          <BodyText style={{ fontSize: 18 }}>
            {Math.round(item.calories)}
          </BodyText>
        </TouchableOpacity>
      ))}

      {showAdd && (
        <TouchableOpacity
          style={{ paddingVertical: 12, alignItems: "center" }}
          activeOpacity={0.8}
        >
          <FontAwesome
            name="plus"
            size={24}
            color={colors.primary.dark}
            onPress={() => {
              router.push({
                pathname: "/diary/searchFood",
                params: { id: user_id, date: date },
              });
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MealTable;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 6,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
    paddingHorizontal: 10,
    alignItems: "center",
  },
});
