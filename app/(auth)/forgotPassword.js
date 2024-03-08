import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import InputFields from "../../components/InputFields";
import StyledButton from "../../components/StyledButton";
import { BodyText, HeaderText } from "../../components/StyledText";
import { ERROR_MESSAGES } from "../../helpers/constants";
import { colors } from "../../helpers/theme";
import useForgotPassword from "../../hooks/useForgotPassword";
import { useRouter } from "expo-router";

const forgotPassword = () => {
  const { forgotPassword } = useForgotPassword();
  const [error, setError] = useState(null);
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (data) => {
    const { email } = data;
    try {
      const response = await forgotPassword({ email });

      const user_id = response.id;

      if (response.success) {
        setError(null);
        router.push(`/resetCode/${user_id}`);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("ERROR FROM LOGIN: ", error);
      setError("Unexpected error occured. Try again later.");
    }
  };
  return (
    <View
      style={{
        flex: 1,
        gap: 25,
        paddingHorizontal: 25,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ marginVertical: 50 }}>
        <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
          Find your account
        </HeaderText>
        <BodyText style={{ textAlign: "center", color: colors.gray }}>
          Enter your email address linked to your account.
        </BodyText>
      </View>
      <BodyText style={{ color: colors.error.normal, textAlign: "center" }}>
        {error}
      </BodyText>
      <View>
        <Controller
          control={control}
          name="email"
          disabled={isSubmitting}
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="Email Address"
              placeholder="Enter your email address"
              value={value}
              isInvalid={errors.email ? true : false}
              onChangeText={onChange}
              errorText={errors.email?.message}
            />
          )}
        />
      </View>
      <StyledButton
        title="Next"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};

export default forgotPassword;
