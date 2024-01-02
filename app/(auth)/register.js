import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InputFields from "../../components/InputFields";
import Logo from "../../components/Logo";
import StyledButton from "../../components/StyledButton";
import { BodyText, HeaderText, LinkText } from "../../components/StyledText";
import { colors } from "../../helpers/theme";
import { useForm, Controller } from "react-hook-form";
import { ERROR_MESSAGES, REGEX } from "../../helpers/constants";
import useRegister from "../../hooks/useRegister";
import { useRouter } from "expo-router";

const register = () => {
  const router = useRouter();
  // For react hook form
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm({
    mode: "onChange",
  });

  const [error, setError] = useState(null);

  const password = useRef({});
  password.current = watch("password", "");

  const { register } = useRegister();

  const onSubmit = async (data) => {
    const { name, email, password } = data;

    try {
      const response = await register({ name, email, password });
      if (response.success) {
        reset();
        setError(null);
        router.push(`/aboutYou/${email}`);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: register.js:28 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };

  return (
    <KeyboardAwareScrollView
      extraHeight={180}
      enableOnAndroid={true}
      style={{
        paddingHorizontal: 25,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ gap: 25, marginTop: 50 }}>
        <View style={{ alignItems: "center", marginVertical: 25 }}>
          <Logo />
        </View>
        <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
          Register your account
        </HeaderText>

        <BodyText style={{ color: colors.error.normal, textAlign: "center" }}>
          {error}
        </BodyText>

        <View style={{ gap: 15 }}>
          <Controller
            control={control}
            name="name"
            rules={{
              required: { value: true, message: ERROR_MESSAGES.REQUIRED },
              pattern: {
                value: REGEX.personalName,
                message: ERROR_MESSAGES.NAME_INVALID,
              },
              validate: (value) => {
                return !!value.trim() || ERROR_MESSAGES.NAME_INVALID;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputFields
                title="Full Name"
                placeholder="Enter your full name"
                value={value}
                isInvalid={errors.name ? true : false}
                onChangeText={onChange}
                errorText={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{
              required: { value: true, message: ERROR_MESSAGES.REQUIRED },
              pattern: {
                value: REGEX.email,
                message: "Invalid email address.",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputFields
                title="Email Address"
                placeholder="Enter your email address"
                value={value}
                type="email-address"
                isInvalid={errors.email ? true : false}
                onChangeText={onChange}
                errorText={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{
              required: { value: true, message: ERROR_MESSAGES.REQUIRED },
            }}
            render={({ field: { onChange, value } }) => (
              <InputFields
                title="Password"
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
          title="Register"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <LinkText
          href="/login"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          Already have an account? Login
        </LinkText>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default register;
