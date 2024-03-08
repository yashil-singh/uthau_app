import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import MainContainer from "../../../components/MainContainer";
import { BodyText } from "../../../components/StyledText";
import useResendVerification from "../../../hooks/useResendVerification";
import { colors } from "../../../helpers/theme";
import { useLogout } from "../../../hooks/useLogout";
import { decode as atob, encode as btoa } from "base-64";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

const emailVerification = () => {
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { logout } = useLogout();

  const { user } = useAuthContext();

  var email = null;

  if (user) {
    const token = user?.token;

    const decodedToken = JSON.parse(atob(token?.split(".")[1]));

    email = decodedToken.user_email;
  }

  const { resendVerification } = useResendVerification();

  const onResendClick = async () => {
    setErrorMessage("");
    setMessage("");
    const response = await resendVerification({ email });
    console.log("🚀 ~ response:", response);
    if (response.success) {
      setMessage(response.message);
    } else {
      setErrorMessage(response.message);
    }
  };

  return (
    <MainContainer padding={15}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 10 }}>
          <BodyText style={{ textAlign: "center" }}>
            A verification link has been sent to your email. Please check your
            mail and click on the to verify your account.
          </BodyText>
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
          {errorMessage && (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Entypo
                name="circle-with-cross"
                size={24}
                color={colors.error.dark}
              />
              <BodyText
                style={{ color: colors.error.normal, textAlign: "left" }}
              >
                {errorMessage}
              </BodyText>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={logout}
          style={{
            justifyContent: "center",
            marginBottom: "15px",
          }}
        >
          <BodyText style={{ color: colors.links, textAlign: "center" }}>
            Go to login page.
          </BodyText>
        </TouchableOpacity>
      </View>
    </MainContainer>
  );
};

export default emailVerification;
