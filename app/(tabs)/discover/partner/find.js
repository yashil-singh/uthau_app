import { View, Text } from "react-native";
import React from "react";
import MainContainer from "../../../../components/MainContainer";
import { HeaderText, SubHeaderText } from "../../../../components/StyledText";

const find = () => {
  return (
    <MainContainer padding={15}>
      <SubHeaderText style={{ fontSize: 20 }}>Near You</SubHeaderText>
    </MainContainer>
  );
};

export default find;
