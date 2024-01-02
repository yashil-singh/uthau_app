import { StyleSheet, View } from "react-native";
import React from "react";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "../helpers/theme";
import { BodyText } from "./StyledText";

const DropdownPicker = ({ title, options, placeholder, value, onChange }) => {
  return (
    <View style={{ gap: 5 }}>
      <BodyText>{title}</BodyText>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        activeColor={colors.primary.light}
        data={options}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 2,
    borderColor: "#e3e3e3",
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  itemTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default DropdownPicker;
