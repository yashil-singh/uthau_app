import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CheckBox from "../../components/CheckBox";
import InputFields from "../../components/InputFields";
import Logo from "../../components/Logo";
import StyledButton from "../../components/StyledButton";
import { BodyText, HeaderText, LinkText } from "../../components/StyledText";
import { ERROR_MESSAGES } from "../../helpers/constants";
import { colors } from "../../helpers/theme";
import useLogin from "../../hooks/useLogin";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const login = () => {
  const [error, setError] = useState(null);
  const { login } = useLogin();
  const router = useRouter();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({ mode: "onSubmit" });

  const onSubmit = async (data) => {
    const { email, password, keepLoggedIn } = data;
    try {
      const response = await login({ email, password, keepLoggedIn });

      if (response.success) {
        setError(null);
        router.push("/home");
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.log("🚀 ~ file: login.js:37 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.white, flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ paddingHorizontal: 25, backgroundColor: colors.white }}
      >
        <View
          style={{
            gap: 25,
          }}
        >
          <View style={{ alignItems: "center", marginVertical: 25 }}>
            <Logo />
          </View>
          <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
            Login to your account
          </HeaderText>

          <BodyText style={{ color: colors.error.normal, textAlign: "center" }}>
            {error}
          </BodyText>

          <View style={{ gap: 8 }}>
            <View style={{ marginBottom: errors.root ? 10 : 0, gap: 10 }}>
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
                disabled={isSubmitting}
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
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Controller
                control={control}
                defaultValue={false}
                name="keepLoggedIn"
                render={({ field: { value, onChange } }) => (
                  <CheckBox
                    isChecked={value}
                    text="Keep me logged in."
                    onPress={() => onChange(!value)}
                  />
                )}
              />

              <LinkText href="/forgotPassword">Forgot password?</LinkText>
            </View>
          </View>

          <StyledButton
            title="Login"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <LinkText
            href="/register"
            style={{ textAlign: "center", marginBottom: 20 }}
          >
            Don't have an account? Register
          </LinkText>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default login;
