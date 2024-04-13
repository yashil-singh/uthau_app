import { Image, Pressable, View } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../helpers/theme";
import { BodyText, HeaderText } from "./StyledText";
import formatWord from "../helpers/formatWord";
import { TouchableRipple } from "react-native-paper";

const CardOption = ({
  title,
  target,
  desc,
  gifUrl,
  onPress,
  isSaved,
  style,
  handleSave,
  handleRemove,
}) => {
  const formattedTitle = formatWord(title);
  const formattedTarget = formatWord(target);

  return (
    <View
      style={{
        ...style,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e3e3e3",
        flexDirection: "row",
        padding: 15,
      }}
    >
      <Pressable
        style={{
          flexDirection: "row",
          backgroundColor: colors.white,
          flex: 1,
          justifyContent: "center",
          gap: 15,
        }}
        onPress={onPress}
      >
        <View>
          <Image
            source={{ uri: `${gifUrl}` }}
            style={{
              width: 120,
              height: 140,
              borderRadius: 8,
            }}
          />
        </View>
        <View
          style={{
            flex: 6,
          }}
        >
          <View style={{ flex: 2, gap: 5 }}>
            <View>
              <HeaderText style={{ fontSize: 14 }}>{formattedTitle}</HeaderText>
              <BodyText style={{ color: colors.gray }}>
                {desc} {formattedTarget}
              </BodyText>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          ></View>
        </View>
      </Pressable>
      <View
        style={{
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {isSaved ? (
          <TouchableRipple
            rippleColor="rgba(0, 0, 0, 0.1)"
            onPress={handleRemove}
            style={{
              borderRadius: 60,
              paddingVertical: 4,
              paddingHorizontal: 7,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            borderless
          >
            <FontAwesome
              name="bookmark"
              size={24}
              color={colors.warning.normal}
            />
          </TouchableRipple>
        ) : (
          <TouchableRipple
            rippleColor="rgba(0, 0, 0, 0.1)"
            onPress={handleSave}
            style={{
              borderRadius: 60,
              paddingVertical: 4,
              paddingHorizontal: 7,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            borderless
          >
            <FontAwesome
              name="bookmark-o"
              size={24}
              color={colors.warning.normal}
            />
          </TouchableRipple>
        )}
      </View>
    </View>
  );
};

export default CardOption;
