import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { BodyText, SubHeaderText } from "./StyledText";
import { colors } from "../helpers/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MealTable = ({ foodLogs, mealType }) => {
  const router = useRouter();
  const filteredLogs = foodLogs.filter((log) => log.mealType === mealType);
  const foods = filteredLogs.map((log) => log.food).flat();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SubHeaderText style={{ fontSize: 20 }}>{mealType}</SubHeaderText>
        <SubHeaderText style={{ color: colors.warning.normal, fontSize: 20 }}>
          310
        </SubHeaderText>
      </View>

      {foods.map((item) => (
        <TouchableOpacity style={styles.row} key={item.id} activeOpacity={0.8}>
          <View style={{ flex: 1, gap: 5 }}>
            <BodyText style={{ fontSize: 18 }}>{item}</BodyText>
            <BodyText style={{ color: colors.gray }}>Quantity: 2</BodyText>
          </View>
          <BodyText style={{ fontSize: 20 }}>310</BodyText>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={{ paddingVertical: 12, alignItems: "center" }}
        activeOpacity={0.8}
      >
        <FontAwesome
          name="plus"
          size={24}
          color={colors.primary.dark}
          onPress={() => {
            router.push("/diary/searchFood");
          }}
        />
      </TouchableOpacity>
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
    paddingVertical: 15,
    paddingHorizontal: 10,
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
