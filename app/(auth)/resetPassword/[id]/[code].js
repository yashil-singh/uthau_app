import { View, Text, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { ERROR_MESSAGES } from "../../../../helpers/constants";
import StyledButton from "../../../../components/StyledButton";
import InputFields from "../../../../components/InputFields";
import {
  BodyText,
  HeaderText,
  LinkText,
} from "../../../../components/StyledText";
import { colors } from "../../../../helpers/theme";
import useResetPassword from "../../../../hooks/useResetPassword";

const resetPassword = () => {
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id, code } = useLocalSearchParams();

  const { resetPassword } = useResetPassword();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
    reset,
  } = useForm({ mode: "onSubmit" });

  const password = useRef({});
  password.current = watch("password", "");

  const onSubmit = async (data) => {
    const { password } = data;

    try {
      const response = await resetPassword({ id, code, password });

      if (response.success) {
        setError(null);
        router.replace("/login");
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: [code].js:29 ~ error:", error);
      setError("Unexpected error occurred. Try again later.");
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
          Enter New Password
        </HeaderText>
        <BodyText style={{ textAlign: "center", color: colors.gray }}>
          Password must be at least 8 characters and contain at least one
          uppercase and one lowercase letter and one number. Passwords are case
          sensative.
        </BodyText>
      </View>
      <BodyText style={{ color: colors.error.normal, textAlign: "center" }}>
        {error}
      </BodyText>
      <View style={{ gap: 15 }}>
        <Controller
          control={control}
          disabled={isSubmitting}
          name="password"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="New Password"
              placeholder="Enter your password"
              value={value}
              isPassword={true}
              isInvalid={errors.password ? true : false}
              onChangeText={onChange}
              errorText={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          disabled={isSubmitting}
          name="confirmPassword"
          rules={{
            required: { value: true, message: ERROR_MESSAGES.REQUIRED },
            validate: (value) =>
              value === password.current || "The passwords don't match.",
          }}
          render={({ field: { onChange, value } }) => (
            <InputFields
              title="Confirm Password"
              placeholder="Enter your password again"
              value={value}
              isPassword={true}
              isInvalid={errors.confirmPassword ? true : false}
              onChangeText={onChange}
              errorText={errors.confirmPassword?.message}
            />
          )}
        />
      </View>
      <StyledButton
        title="Reset"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};

export default resetPassword;
