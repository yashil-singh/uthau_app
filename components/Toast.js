import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import { colors } from "../helpers/theme";
import { BodyText } from "./StyledText";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { Portal, Snackbar } from "react-native-paper";
const Toast = ({ message, isVisible, type }) => {
  return (
    <>
      {/* {isVisible && (
        <Animated.View
          entering={SlideInUp}
          exiting={SlideOutUp}
          style={{
            position: "absolute",
            display: "flex",
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: Dimensions.get("window").width - 15,
              width: "auto",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.lightGray,
              display: "flex",
              gap: 5,
              padding: 5,
              backgroundColor: colors.white,
            }}
          >
            {type === "success" && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={colors.success.normal}
              />
            )}
            {type === "warning" && (
              <MaterialIcons
                name="warning"
                size={20}
                color={colors.warning.normal}
              />
            )}
            {type === "error" && (
              <MaterialIcons
                name="error"
                size={20}
                color={colors.error.normal}
              />
            )}
            <BodyText>{message}</BodyText>
          </View>
        </Animated.View>
      )} */}
      <Portal>
        <Snackbar
          visible={isVisible}
          wrapperStyle={{ backgroundColor: colors.white }}
        >
          {type === "success" && (
            <MaterialIcons
              name="check-circle"
              size={20}
              color={colors.success.normal}
            />
          )}
          {type === "warning" && (
            <MaterialIcons
              name="warning"
              size={20}
              color={colors.warning.normal}
            />
          )}
          {type === "error" && (
            <MaterialIcons name="error" size={20} color={colors.error.normal} />
          )}
          <BodyText style={{ color: colors.white }}>{message}</BodyText>
        </Snackbar>
      </Portal>
    </>
  );
};

export default Toast;
