import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { colors } from "../../../helpers/theme";
import { BodyText, HeaderText, LinkText } from "../../../components/StyledText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { ERROR_MESSAGES } from "../../../helpers/constants";
import StyledButton from "../../../components/StyledButton";
import InputFields from "../../../components/InputFields";
import useCheckRestCode from "../../../hooks/useCheckRestCode";
import useResendCode from "../../../hooks/useResendCode";
import { FontAwesome } from "@expo/vector-icons";

const resetCode = () => {
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { checkResetCode } = useCheckRestCode();
  const { resendCode } = useResendCode();
  const [message, setMessage] = useState(null);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({ mode: "onSubmit" });

  const onResendClick = async () => {
    try {
      const response = await resendCode({ id });
      setError(null);
      setMessage("Email Sent successfully!");
      if (response.success) {
        setMessage("Email Sent successfully!");
        console.log(message);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: [code].js:45 ~ error:", error);
      setError("Unexpected error occurred. Try again later.");
    }
  };

  const onSubmit = async (data) => {
    const { resetCode } = data;

    try {
      const response = await checkResetCode({ id, resetCode });
      if (response.success) {
        setError(null);
        router.push(`/resetPassword/${id}/${resetCode}`);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: [id].js:37 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };
  return (
    <View
      style={{
        flex: 1,
        gap: 25,
        padding: 25,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ gap: 25, flex: 1 }}>
        <View style={{ marginVertical: 50 }}>
          <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
            Reset Code Sent
          </HeaderText>
          <BodyText style={{ textAlign: "center", color: colors.gray }}>
            Enter the 6-digit reset code that we sent to your email.
          </BodyText>
        </View>
        <BodyText style={{ color: colors.error.normal, textAlign: "center" }}>
          {error}
        </BodyText>
        <View>
          <Controller
            control={control}
            disabled={isSubmitting}
            name="resetCode"
            rules={{
              required: { value: true, message: ERROR_MESSAGES.REQUIRED },
            }}
            render={({ field: { onChange, value } }) => (
              <InputFields
                title="Reset Code"
                placeholder="Enter reset code"
                type="numeric"
                value={value}
                isInvalid={errors.resetCode ? true : false}
                onChangeText={onChange}
                errorText={errors.resetCode?.message}
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
        <View style={{ alignItems: "center", gap: 15 }}>
          <TouchableOpacity
            onPress={onResendClick}
            style={{
              justifyContent: "center",
            }}
          >
            <BodyText style={{ color: colors.links, textAlign: "center" }}>
              If you didn't receive any email,{"\n"}click here to resend.
            </BodyText>
          </TouchableOpacity>
          {message && (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <FontAwesome
                name="check-circle"
                size={24}
                color={colors.success.normal}
              />
              <BodyText style={{ color: colors.success.normal }}>
                {message}
              </BodyText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default resetCode;
