import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
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
import InputFields from "../../../components/InputFields";
import useDecode from "../../../hooks/useDecode";
import Toast from "../../../components/Toast";
import { useRouter } from "expo-router";
import Portal from "react-native-paper/src/components/Portal/Portal";
import { Snackbar } from "react-native-paper";

const generate = () => {
  const { onActivateMembership } = useGym();
  const { user } = useAuthContext();

  const router = useRouter();

  const [currentUser, setCurrentUser] = useState({});
  const { getDecodedToken } = useDecode();

  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
        if (currentUser) {
          setIsPageLoading(false);
          const user = response?.user;

          if (user.role !== "normal") {
            router.back();
          }
        }
      }
    };

    fetchDecodedToken();
  }, [user]);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [code, setCode] = useState("");

  const [errorText, setErrorText] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const onOpenToast = ({ message, type }) => {
    setOpenToast(true);
    setToastMessage(message);
    setToastType(type);
  };

  const onCloseToast = () => {
    setOpenToast(false);
    setToastMessage("");
    setToastType("");
  };

  const onRequestMembership = async () => {
    if (code == "") {
      setErrorText("This field is required.");
      setIsInvalid(true);
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);

    const response = await onActivateMembership({
      user_id: currentUser?.user_id,
      code: code,
    });
    console.log("🚀 ~ response:", response);

    if (response.success) {
      onOpenToast({ message: response?.message, type: "success" });

      setTimeout(() => {
        router.back();
      }, 5000);
    } else {
      onOpenToast({ message: response?.message, type: "error" });
    }

    setTimeout(() => onCloseToast(), 3000);

    setIsLoading(false);
    setIsDisabled(false);
    setErrorText("");
    setIsInvalid(false);
  };

  return (
    <>
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <MainContainer padding={15}>
          <Portal>
            <Snackbar
              visible={openToast}
              onDismiss={() => setOpenToast(false)}
              action={{
                label: "close",
                labelStyle: {
                  color: colors.primary.normal,
                },
              }}
              duration={2000}
              style={{ backgroundColor: colors.white }}
            >
              <BodyText>{toastMessage}</BodyText>
            </Snackbar>
          </Portal>
          <BodyText>
            Please enter the code given to you by the gym to claim your
            membership.
          </BodyText>

          <View style={{ marginTop: 15 }}>
            <InputFields
              placeholder={"Enter your code"}
              title={"Member Code"}
              value={code}
              onChangeText={(e) => setCode(e)}
              errorText={errorText}
              isInvalid={isInvalid}
              type={"numeric"}
            />
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <StyledButton
              title={"Submit"}
              isLoading={isLoading}
              isDisabled={isDisabled}
              onPress={onRequestMembership}
            />
          </View>
        </MainContainer>
      )}
    </>
  );
};

export default generate;
