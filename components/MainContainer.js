import { View } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";

const MainContainer = ({ children, gap }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        gap: gap,
        padding: 15,
        paddingBottom: 30,
      }}
    >
      {children}
    </View>
  );
};

export default MainContainer;
