import { View, Text, KeyboardAvoidingView } from "react-native";
import React, { useEffect, useState } from "react";
import { BodyText, HeaderText } from "../../components/StyledText";
import { useRegisterContext } from "../../hooks/useRegisterContext";
import { useRouter } from "expo-router";
import { colors } from "../../helpers/theme";
import StyledButton from "../../components/StyledButton";
import useRegister from "../../hooks/useRegister";

const confirmation = () => {
  const { data } = useRegisterContext();

  const { register } = useRegister();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    name,
    email,
    password,
    age,
    genderValue,
    height,
    weight,
    activityValue,
    weightGoalValue,
  } = data;

  const gender = genderValue.value;
  const activityLevel = activityValue.value;
  const weightGoal = weightGoalValue.value;

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await register({
        name,
        email,
        password,
        age,
        gender,
        height,
        weight,
        activityLevel,
        weightGoal,
      });
      if (response.success) {
        setError(null);
        setIsLoading(false);
        router.push("/accountCreated");
      } else {
        setError(response.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("🚀 ~ file: register.js:28 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        padding: 25,
        backgroundColor: colors.white,
        justifyContent: "space-between",
      }}
    >
      <View style={{ gap: 15 }}>
        <BodyText style={{ color: colors.gray, fontSize: 16 }}>
          Please confirm your details before continuing.
        </BodyText>
        <View>
          <HeaderText>Full Name:</HeaderText>
          <BodyText>{name}</BodyText>
        </View>
        <View>
          <HeaderText>Email Address:</HeaderText>
          <BodyText>{email}</BodyText>
        </View>
        <View>
          <HeaderText>Age:</HeaderText>
          <BodyText>{age}</BodyText>
        </View>
        <View>
          <HeaderText>Gender:</HeaderText>
          <BodyText>{gender}</BodyText>
        </View>
        <View>
          <HeaderText>Height:</HeaderText>
          <BodyText>{height}cm</BodyText>
        </View>
        <View>
          <HeaderText>Weight:</HeaderText>
          <BodyText>{weight}kg</BodyText>
        </View>
        <View>
          <HeaderText>Activity Level:</HeaderText>
          <BodyText>{activityLevel}</BodyText>
        </View>
        <View>
          <HeaderText>Weight Goal:</HeaderText>
          <BodyText>{weightGoal}</BodyText>
        </View>
      </View>
      <View>
        <BodyText style={{ color: colors.warning.normal }}>{error}</BodyText>
        <StyledButton
          title="Confirm"
          isLoading={isLoading}
          isDisabled={isLoading}
          onPress={onSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default confirmation;
