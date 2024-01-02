import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import MainContainer from "../../../components/MainContainer";
import { BodyText } from "../../../components/StyledText";
import useResendVerification from "../../../hooks/useResendVerification";
import { useLocalSearchParams } from "expo-router";
import { colors } from "../../../helpers/theme";

const emailVerification = () => {
  const [message, setMessage] = useState(null);
  const { email } = useLocalSearchParams();
  console.log("🚀 ~ file: [email].js:13 ~ email:", email);

  const { resendVerification } = useResendVerification();

  const onResendClick = async () => {
    const response = await resendVerification({ email });
  };

  return (
    <MainContainer>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BodyText style={{ textAlign: "center" }}>
          A verification link has been sent to your email. Please check your
          mail and click on the to verify your account.
        </BodyText>
        <View>
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
    </MainContainer>
  );
};

export default emailVerification;
