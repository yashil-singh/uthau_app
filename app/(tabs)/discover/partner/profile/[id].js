import { View, Text, Image } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import MainContainer from "../../../../../components/MainContainer";
import { TouchableRipple } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { BodyText, HeaderText } from "../../../../../components/StyledText";
import { useUsers } from "../../../../../hooks/useUsers";
import ErrorModal from "../../../../../components/ErrorModal";
import { colors } from "../../../../../helpers/theme";
import StyledButton from "../../../../../components/StyledButton";

const index = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const { getUserDetail } = useUsers();

  const [userDetails, setUserDetails] = useState({});

  // Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const fetchUserDetails = async () => {
    const response = await getUserDetail({ user_id: id });
    if (response.success) {
      setUserDetails(response?.data[0]);
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response.message);
      setModalTitle("Error fetching user's details");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <TouchableRipple style={{ borderRadius: 100, padding: 5 }}>
          <Feather
            name="arrow-left"
            size={24}
            color="black"
            onPress={() => router.back()}
          />
        </TouchableRipple>
      ),
    });
  });
  return (
    <MainContainer padding={15}>
      <ErrorModal
        openErrorModal={openErrorModal}
        message={errorMessage}
        title={modalTitle}
      />
      <Image
        source={{ uri: userDetails?.image }}
        width={150}
        height={150}
        style={{ borderRadius: 100, alignSelf: "center", marginBottom: 15 }}
      />
      <HeaderText style={{ fontSize: 18, textAlign: "center" }}>
        {userDetails?.name}
      </HeaderText>
      <BodyText
        style={{ color: colors.gray, textAlign: "center", marginBottom: 10 }}
      >
        {userDetails?.email}
      </BodyText>
      <BodyText style={{ color: colors.gray, textAlign: "center" }}>
        Friends since:{" "}
      </BodyText>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <StyledButton
          style={{ width: "100%" }}
          title={"Remove Friend"}
          color={colors.error.normal}
        ></StyledButton>
      </View>
    </MainContainer>
  );
};

export default index;
