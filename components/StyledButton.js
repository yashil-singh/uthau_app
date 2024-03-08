import { TouchableOpacity } from "react-native";
import React from "react";
import { HeaderText } from "./StyledText";
import { colors } from "../helpers/theme";
import Loader from "./Loader";

const StyledButton = ({ title, onPress, isDisabled, isLoading, children }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: isDisabled ? "#e3e3e4" : colors.primary.normal,
        padding: 10,
        borderRadius: 5,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <HeaderText
          style={{
            textAlign: "center",
            color: isDisabled ? "#989799" : colors.white,
          }}
        >
          {title}
        </HeaderText>
      )}
      {children}
    </TouchableOpacity>
  );
};

export default StyledButton;
