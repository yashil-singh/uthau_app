import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InputFields from "../../components/InputFields";
import Logo from "../../components/Logo";
import StyledButton from "../../components/StyledButton";
import { BodyText, HeaderText, LinkText } from "../../components/StyledText";
import { colors } from "../../helpers/theme";
import { useForm, Controller } from "react-hook-form";
import { ERROR_MESSAGES, REGEX, apiURL } from "../../helpers/constants";
import useRegister from "../../hooks/useRegister";
import { useRouter } from "expo-router";
import { useRegisterContext } from "../../hooks/useRegisterContext";
import { RegisterContextProvider } from "../../context/RegisterContext";
import About from "./about";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const register = () => {
  const router = useRouter();
  const { dispatch } = useRegisterContext();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
    reset,
  } = useForm();

  const validateForm = async ({ email, password }) => {
    setError(null);
    try {
      await axios.post(`${apiURL}/auth/check-user`, {
        email,
        password,
      });
    } catch (error) {
      setError(error.response?.data.message);
      return false;
    }
    return true;
  };

  const nextPage = async (data) => {
    const valid = await validateForm(data);
    if (valid) {
      dispatch({ type: "SET_DATA", payload: data });
      router.push("/about");
    }
  };

  const [error, setError] = useState(null);

  const password = useRef({});
  password.current = watch("password", "");

  return (
    <SafeAreaView style={{ backgroundColor: colors.white, flex: 1 }}>
      <KeyboardAwareScrollView
        style={{
          flex: 1,
          paddingHorizontal: 25,
          backgroundColor: colors.white,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 25 }}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            title="Register"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={handleSubmit(nextPage)}
          />

          <LinkText
            href="/login"
            style={{ textAlign: "center", marginBottom: 20 }}
          >
            Already have an account? Login
          </LinkText>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default register;
