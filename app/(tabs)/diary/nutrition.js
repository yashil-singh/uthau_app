import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { HeaderText } from "../../../components/StyledText";
import { SegmentedButtons } from "react-native-paper";

const nutrition = () => {
  const [selectedOption, setSelectedOption] = useState("calories");
  return (
    <MainContainer padding={15}>
      <SegmentedButtons
        value={selectedOption}
        onValueChange={setSelectedOption}
        buttons={[
          {
            value: "calories",
            label: "Calories",
          },
          {
            value: "nutrients",
            label: "Nutrients",
          },
        ]}
      />
    </MainContainer>
  );
};

export default nutrition;

const styles = StyleSheet.create({});
