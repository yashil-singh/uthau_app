import { View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import StyledButton from "../../../components/StyledButton";
import useGym from "../../../hooks/useGym";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { colors } from "../../../helpers/theme";
import ErrorModal from "../../../components/ErrorModal";

const generate = () => {
  const { getMemberCode } = useGym();
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const userDetails = decodedToken?.user;

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [openGenerateCodeErrorModal, setOpenGenerateCodeErrorModal] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [code, setCode] = useState("");

  const onGenerateCode = async () => {
    setIsDisabled(true);
    setIsLoading(true);
    const response = await getMemberCode({ user_id: userDetails.user_id });

    if (response.success) {
      setCode(response?.code);
    } else {
      setOpenGenerateCodeErrorModal(true);
      setErrorMessage(response.message);
    }
    setIsDisabled(false);
    setIsLoading(false);
  };
  return (
    <MainContainer padding={15}>
      <ErrorModal
        openErrorModal={openGenerateCodeErrorModal}
        message={errorMessage}
        onClose={() => {
          setOpenGenerateCodeErrorModal(false);
          setErrorMessage("");
        }}
      ></ErrorModal>
      <BodyText>
        Generate a code to claim your membership. Contact the gym to claim your
        membership.
      </BodyText>
      <View
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <View>
          {code ? (
            <>
              <SubHeaderText style={{ textAlign: "center", marginTop: 15 }}>
                Your generated code:
              </SubHeaderText>
              <HeaderText style={{ textAlign: "center", fontSize: 32 }}>
                {code}
              </HeaderText>
            </>
          ) : (
            <></>
          )}
        </View>
        <StyledButton
          style={{ width: "100%", alignSelf: "flex-end" }}
          title={"Generate Code"}
          onPress={() => onGenerateCode()}
          isDisabled={isDisabled}
          isLoading={isLoading}
        ></StyledButton>
      </View>
    </MainContainer>
  );
};

export default generate;
