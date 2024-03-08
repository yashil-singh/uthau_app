import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BodyText, HeaderText } from "../../components/StyledText";
import { colors } from "../../helpers/theme";
import { useRegisterContext } from "../../hooks/useRegisterContext";
import axios from "axios";
import { apiURL } from "../../helpers/constants";
import StyledButton from "../../components/StyledButton";
import useLogin from "../../hooks/useLogin";

const accountCreated = () => {
  const { data } = useRegisterContext();

  const { email, password } = data;

  const [calorieBurn, setCalorieBurn] = useState(0);
  const [calorieIntake, setCalorieIntake] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useLogin();

  useEffect(() => {
    const getColories = async () => {
      try {
        const response = await axios.post(`${apiURL}/auth/get-calories`, {
          email,
        });
        if (response.data.success) {
          setCalorieBurn(response.data.calorieBurn);
          setCalorieIntake(response.data.calorieIntake);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getColories();
  }, []);

  const onContinue = async () => {
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      if (response.success) {
        setError(null);
        setIsLoading(false);
        router.push("/home");
      } else {
        setError(response.error);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("🚀 ~ login error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 25,
        justifyContent: "space-between",
        backgroundColor: colors.white,
      }}
    >
      <View style={{ flex: 1, gap: 40 }}>
        <HeaderText style={{ fontSize: 24 }}>Account Created</HeaderText>
        <View style={{ gap: 30 }}>
          <HeaderText style={{ textAlign: "center", fontSize: 18 }}>
            Congratulations!
          </HeaderText>
          <BodyText style={{ color: colors.gray, textAlign: "center" }}>
            Your account was sucessfully created. Good luck on your fitness
            journey. Don't worry! We will be with you through all of it.
          </BodyText>
          <HeaderText style={{ textAlign: "center" }}>
            Your recommended daily calorie goal are:
          </HeaderText>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <HeaderText
                style={{ fontSize: 32, color: colors.warning.normal }}
              >
                {calorieIntake.toLocaleString()}
              </HeaderText>
              <HeaderText style={{ fontSize: 18 }}>kcal Intake</HeaderText>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <HeaderText style={{ fontSize: 32, color: colors.orange.normal }}>
                {calorieBurn.toLocaleString()}
              </HeaderText>
              <HeaderText style={{ fontSize: 18 }}>kcal Burn</HeaderText>
            </View>
          </View>
        </View>
      </View>

      <View style={{ gap: 5 }}>
        <BodyText style={{ color: colors.warning.normal }}>{error}</BodyText>
        <StyledButton
          title="Continue"
          isDisabled={isLoading}
          isLoading={isLoading}
          onPress={onContinue}
        />
      </View>
    </SafeAreaView>
  );
};

export default accountCreated;
