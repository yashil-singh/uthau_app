import { View } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";

const MainContainer = ({ children, gap, padding }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        gap: gap,
        padding: padding,
      }}
    >
      {children}
    </View>
  );
};

export default MainContainer;
