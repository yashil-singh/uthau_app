import { TouchableOpacity } from "react-native";
import React from "react";
import { HeaderText } from "./StyledText";
import { colors } from "../helpers/theme";
import Loader from "./Loader";

const StyledButton = ({
  title,
  onPress,
  isDisabled,
  isLoading,
  children,
  style,
  color,
  textColor,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: isDisabled
          ? "#e3e3e4"
          : color
          ? color
          : colors.primary.normal,
        padding: 10,
        borderRadius: 5,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        minHeight: 15,
        ...style,
      }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {children}
          <HeaderText
            style={{
              textAlign: "center",
              color: isDisabled
                ? "#989799"
                : textColor
                ? textColor
                : colors.white,
            }}
          >
            {title}
          </HeaderText>
        </>
      )}
    </TouchableOpacity>
  );
};

export default StyledButton;
