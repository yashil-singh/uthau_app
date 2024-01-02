import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../helpers/theme";
import { BodyText } from "./StyledText";

const CheckBox = ({ text, isChecked, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
    >
      {isChecked ? (
        <FontAwesome5
          name="check-square"
          size={20}
          color={colors.primary.normal}
        />
      ) : (
        <FontAwesome5 name="square" size={20} color={colors.primary.normal} />
      )}
      <BodyText>{text}</BodyText>
    </Pressable>
  );
};

export default CheckBox;
