import { View, Text, Pressable, TextInput, Platform } from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { BodyText } from "./StyledText";
import { colors } from "../helpers/theme";

const StyledDatePicker = ({
  title,
  placeholder,
  value,
  onChangeText,
  isInvalid,
  errorText,
  textStyle,
  isEditable,
  onPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <BodyText style={{ ...textStyle }}>{title}</BodyText>
      <Pressable
        style={{
          paddingHorizontal: 12,
          borderRadius: 5,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: isInvalid
            ? colors.error.normal
            : isFocused
            ? colors.primary.normal
            : colors.lightGray,
        }}
        onPress={onPress}
      >
        <TextInput
          style={{
            paddingVertical: Platform.OS === "ios" ? 15 : 10,
            fontSize: 14,
            color: colors.gray,
            flex: 1,
          }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          editable={isEditable}
        />

        <Feather name="calendar" size={20} color="gray" />
      </Pressable>
      {errorText && (
        <BodyText
          style={{
            color: colors.error.normal,
            marginVertical: errorText ? 5 : 0,
          }}
        >
          {errorText}
        </BodyText>
      )}
    </View>
  );
};

export default StyledDatePicker;
