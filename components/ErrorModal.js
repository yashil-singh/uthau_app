import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../helpers/theme";
import { BodyText, HeaderText, SubHeaderText } from "./StyledText";
import { MaterialIcons } from "@expo/vector-icons";

const ErrorModal = ({ openErrorModal, title, message, onDismiss, onClose }) => {
  return (
    <Modal
      onDismiss={onDismiss}
      transparent
      animationType="fade"
      visible={openErrorModal}
      onRequestClose={onClose}
    >
      <View style={styles.main}>
        <View style={styles.container}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <MaterialIcons
              name="error-outline"
              size={22}
              color={colors.error.normal}
            />
            <SubHeaderText style={{ fontSize: 16 }}>{title}</SubHeaderText>
          </View>

          <BodyText>{message}</BodyText>
          <Pressable onPress={onClose} style={{ alignSelf: "flex-end" }}>
            <BodyText style={{ color: colors.primary.normal }}>Ok</BodyText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 6,
    padding: 15,
    gap: 10,
  },
});
