import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
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
import { useAuthContext } from "../../../../../hooks/useAuthContext";
import useDecode from "../../../../../hooks/useDecode";

const index = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const { getUserDetail, removeFriend, getPartners } = useUsers();

  const [userDetails, setUserDetails] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);

  // Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [openRemoveConfrimModal, setOpenRemoveConfrimModal] = useState(false);

  const fetchPartnerDetails = async () => {
    if (currentUser && userDetails) {
      const response = await getPartners({
        id: currentUser?.user_id,
        id2: userDetails?.user_id,
      });

      if (response.success) {
        setPartnerDetails(response.partners);
      }
    }
  };

  useEffect(() => {
    fetchPartnerDetails();
  }, [userDetails]);

  useEffect(() => {
    if (partnerDetails && !partnerDetails?.isconnected) {
      router.back();
    }
  }, [partnerDetails]);

  const fetchUserDetails = async () => {
    const response = await getUserDetail({ user_id: id });

    if (response.success) {
      setUserDetails(response?.data[0]);
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response.message);
      setModalTitle("Error fetching user's details");
    }
    setIsLoading(false);
  };

  const onRemoveFriend = async () => {
    const response = await removeFriend({
      sender_id: currentUser?.user_id,
      receiver_id: userDetails?.user_id,
    });

    if (response.success) {
      router.replace("(tabs)/discover/partner");
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
      <Modal
        transparent
        animationType="fade"
        visible={openRemoveConfrimModal}
        onRequestClose={() => setOpenRemoveConfrimModal(false)}
        onDismiss={() => setOpenRemoveConfrimModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderRadius: 8,
              backgroundColor: colors.white,
              width: "100%",
              padding: 15,
            }}
          >
            <HeaderText>Remove Friend</HeaderText>
            <BodyText>
              Are you sure you want to continue? All messages with this person
              will be deleted.
            </BodyText>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <StyledButton
                title={"Cancel"}
                color={colors.white}
                textColor={colors.black}
                onPress={() => setOpenRemoveConfrimModal(false)}
              />
              <StyledButton
                title={"Confirm"}
                color={colors.error.normal}
                onPress={onRemoveFriend}
              />
            </View>
          </View>
        </View>
      </Modal>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} />
        </View>
      ) : (
        <>
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
            style={{
              color: colors.gray,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {userDetails?.email}
          </BodyText>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <StyledButton
              style={{ width: "100%" }}
              title={"Remove Friend"}
              color={colors.error.normal}
              onPress={() => setOpenRemoveConfrimModal(true)}
            />
          </View>
        </>
      )}
    </MainContainer>
  );
};

export default index;
