import { Image, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";
import { BodyText, HeaderText } from "./StyledText";

const RecipeCard = ({ title, cals, imageUrl }) => {
  return (
    <TouchableOpacity
      style={{
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.background,
        width: 180,
        height: 230,
        display: "flex",
        alignItems: "center",
      }}
      activeOpacity={0.95}
    >
      <Image
        style={{
          width: 180,
          height: 160,
          resizeMode: "cover",
          borderRadius: 6,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        source={{ uri: `${imageUrl}` }}
      />
      <View
        style={{
          flex: 1,
          width: "100%",
          paddingHorizontal: 8,
          paddingTop: 5,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
        }}
      >
        <HeaderText ellipsis="tail" numOfLines={1}>
          {title}
        </HeaderText>
        <BodyText style={{ color: colors.gray }}>
          {cals?.toLocaleString()} cals
        </BodyText>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
