import { TouchableOpacity, View } from "react-native";
import { AntDesign } from "react-native-vector-icons";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SubHeaderText } from "./StyledText";

const DateNavigator = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const toLocaleDate = (date) => {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  var formattedDate = currentDate.toDateString();

  if (toLocaleDate(currentDate) == toLocaleDate(new Date())) {
    formattedDate = "Today";
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    setCurrentDate(date);
    hideDatePicker();
  };
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={handlePrevDay} activeOpacity={0.8}>
        <AntDesign name="left" size={18} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={showDatePicker} activeOpacity={0.7}>
        <SubHeaderText style={{ fontSize: 18 }}>{formattedDate}</SubHeaderText>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNextDay} activeOpacity={0.8}>
        <AntDesign name="right" size={18} color="black" />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="slider"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default DateNavigator;
