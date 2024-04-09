import { View, Text, Pressable, ActivityIndicator, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import AccountContainer from "../../../components/AccountContainer";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { BodyText, HeaderText } from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { useUsers } from "../../../hooks/useUsers";
import ErrorModal from "../../../components/ErrorModal";
import StyledButton from "../../../components/StyledButton";
import { useLogout } from "../../../hooks/useLogout";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const account = () => {
  const { logout } = useLogout();

  const [isPageLoading, setIsPageLoading] = useState(false);

  const [userDetails, setUserDetails] = useState({});

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const { getUserDetail } = useUsers();

  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const userToken = decodedToken?.user;

  const fetchUserDetails = async () => {
    setIsPageLoading(true);
    const response = await getUserDetail({ user_id: userToken?.user_id });
    if (response.success) {
      const userData = response.data[0];
      setUserDetails(userData);
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response.message);
      setModalTitle("Error fetching user details");
    }
    setIsPageLoading(false);
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user]);

  function formatDate(date) {
    let current = new Date(date);
    let year = current.getFullYear();
    let month = current.getMonth() + 1;
    let day = current.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${day}-${month}-${year}`;
  }

  return (
    <MainContainer padding={15} gap={15}>
      <Modal
        visible={openModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOpenModal(false)}
        onDismiss={() => setOpenModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 15,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 8,
              padding: 15,
              width: "100%",
            }}
          >
            <HeaderText style={{ fontSize: 16, marginBottom: 5 }}>
              Logout
            </HeaderText>
            <BodyText>Are you sure you want to logout?</BodyText>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Pressable onPress={() => setOpenModal(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <StyledButton
                title={"Confirm"}
                onPress={() => logout()}
                style={{ maxWidth: "30%" }}
                color={colors.error.normal}
              ></StyledButton>
            </View>
          </View>
        </View>
      </Modal>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={modalTitle}
        message={errorMessage}
      />
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <AccountContainer size={150} imageURI={userDetails?.image || ""} />
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Feather name="user" size={24} color="black" />
            <HeaderText>Full Name:</HeaderText>
            <BodyText>{userDetails?.name}</BodyText>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Entypo name="email" size={22} color="black" />
            <HeaderText>Email Address:</HeaderText>
            <BodyText>{userDetails?.email}</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FontAwesome name="birthday-cake" size={22} color="black" />
            <HeaderText>Date of Birth:</HeaderText>
            <BodyText>{formatDate(userDetails?.dob)}</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialCommunityIcons
              name="gender-male-female"
              size={24}
              color="black"
            />
            <HeaderText>Gender:</HeaderText>
            <BodyText>{userDetails?.gender}</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={24}
              color="black"
            />
            <HeaderText>Weight:</HeaderText>
            <BodyText>{userDetails?.weight} kg</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialCommunityIcons
              name="human-male-height"
              size={24}
              color="black"
            />
            <HeaderText>Height:</HeaderText>
            <BodyText>{userDetails?.height} inch</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FontAwesome5 name="burn" size={22} color="black" />
            <HeaderText>Calorie Burn:</HeaderText>
            <BodyText>{userDetails?.calorie_burn} cals</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialCommunityIcons name="food-apple" size={24} color="black" />
            <HeaderText>Calorie Intake:</HeaderText>
            <BodyText>{userDetails?.calorie_intake} cals</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Feather name="activity" size={24} color="black" />
            <HeaderText>Activity Intake:</HeaderText>
            <BodyText>{userDetails?.activity_level}</BodyText>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Feather name="target" size={24} color="black" />
            <HeaderText>Goal:</HeaderText>
            <BodyText>{userDetails?.weight_goal}</BodyText>
          </View>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <StyledButton
              style={{ width: "100%" }}
              title={"Logout"}
              onPress={() => setOpenModal(true)}
              color={colors.error.normal}
            />
          </View>
        </>
      )}
    </MainContainer>
  );
};

export default account;
