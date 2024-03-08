import { View, Text, Pressable } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { BodyText, HeaderText, SubHeaderText } from "./StyledText";
import { colors } from "../helpers/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

const OptionsContainer = ({ children, title, desc, color, onPress }) => {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Pressable
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e3e3e3",
          flexDirection: "row",
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 15,
          paddingHorizontal: 15,
          gap: 15,
        }}
        onPress={onPress}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            paddingHorizontal: 13,
            paddingVertical: 15,
          }}
        >
          <View>{children}</View>
        </View>
        <View style={{ flex: 6 }}>
          <SubHeaderText style={{ fontSize: 14 }}>{title}</SubHeaderText>
          <BodyText style={{ color: colors.gray }}>{desc}</BodyText>
        </View>
        <View>
          <Entypo name="chevron-right" size={24} color="black" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default OptionsContainer;
