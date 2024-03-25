import { Pressable, StyleSheet, TextInput, View } from "react-native";
import React, { useState } from "react";
import { BodyText } from "./StyledText";
import { colors } from "../helpers/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const InputFields = ({
  title,
  placeholder,
  type,
  isPassword,
  value,
  onChangeText,
  isInvalid,
  errorText,
  textStyle,
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <BodyText style={{ ...textStyle }}>{title}</BodyText>
      <View
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
      >
        <TextInput
          style={{
            paddingVertical: 12,
            fontSize: 14,
            color: colors.gray,
            flex: 1,
          }}
          placeholder={placeholder}
          secureTextEntry={isSecure}
          value={value}
          keyboardType={type}
          onChangeText={onChangeText}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />
        <Pressable onPress={() => setIsSecure(!isSecure)}>
          {isPassword &&
            (isSecure ? (
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={28}
                color="gray"
              />
            ) : (
              <MaterialCommunityIcons
                name="eye-outline"
                size={28}
                color="gray"
              />
            ))}
        </Pressable>
      </View>
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

export default InputFields;
