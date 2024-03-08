import { ActivityIndicator } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";

const Loader = ({ size }) => {
  return <ActivityIndicator color={colors.primary.dark} size={size} />;
};

export default Loader;
