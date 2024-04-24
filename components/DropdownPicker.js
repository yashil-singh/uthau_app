import { StyleSheet, View } from "react-native";
import React from "react";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "../helpers/theme";
import { BodyText } from "./StyledText";

const DropdownPicker = ({
  title,
  options,
  placeholder,
  value,
  onChange,
  errorText,
  style,
}) => {
  const styles = StyleSheet.create({
    dropdown: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 6,
      paddingHorizontal: 8,
      ...style,
    },
    placeholderStyle: {
      fontSize: 14,
      color: colors.gray,
    },
    selectedTextStyle: {
      fontSize: 14,
      color: colors.gray,
    },
    itemTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
  });

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

      {errorText && (
        <BodyText
          style={{
            color: colors.error.normal,
            marginVertical: errorText ? 5 : 0,
          }}
        >
          {errorText}
        </BodyText>
      )}
    </View>
  );
};
export default DropdownPicker;
