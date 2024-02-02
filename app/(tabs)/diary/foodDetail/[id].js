import { View } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import MainContainer from "../../../../components/MainContainer";
import StyledButton from "../../../../components/StyledButton";

const foodDetail = () => {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  console.log("🚀 ~ id:", id);

  const [quantity, setQuantity] = useState(1);
  const [metric, setMetric] = useState();

  useEffect(async () => {});

  return (
    <MainContainer padding={15}>
      <View></View>
      <StyledButton title="Log Food" style={{ gap: 10 }}></StyledButton>
    </MainContainer>
  );
};

export default foodDetail;
