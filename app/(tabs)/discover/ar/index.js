import { Text, View } from "react-native";
import React from "react";
import MainContainer from "../../../../components/MainContainer";
import OptionsContainer from "../../../../components/OptionsContainer";
import { BodyText, HeaderText } from "../../../../components/StyledText";
import { colors } from "../../../../helpers/theme";

const index = () => {
  return (
    <MainContainer padding={15}>
      <HeaderText style={{ fontSize: 16, textAlign: "center" }}>
        Welcome to the AR World!
      </HeaderText>
      <BodyText style={{ color: colors.gray, textAlign: "center" }}>
        Collect points for completing your goals and challenges.
      </BodyText>

      <HeaderText
        style={{ textAlign: "center", fontSize: 16, marginVertical: 20 }}
      >
        Your Total Points: 2000
      </HeaderText>
      <HeaderText>Today's Goals/Challenges</HeaderText>
    </MainContainer>
  );
};

export default index;
