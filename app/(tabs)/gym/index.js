import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import StyledButton from "../../../components/StyledButton";
import { colors } from "../../../helpers/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OptionsContainer from "../../../components/OptionsContainer";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import useGym from "../../../hooks/useGym";
import ErrorModal from "../../../components/ErrorModal";
import moment from "moment";
import getDaysLeft from "../../../helpers/getDaysLeft";

const index = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const userDetails = decodedToken?.user;

  const { getMemberById } = useGym();

  const [memberDetails, setMemberDetails] = useState({});

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorModalTitle, setErrorModalTitle] = useState("");

  const fetchMemberDetails = async () => {
    const response = await getMemberById({ user_id: userDetails?.user_id });
    if (response.success) {
      setMemberDetails(response.member);
    } else {
      setErrorMessage(response.message);
      setErrorModalTitle("Error fetching member details.");
      setOpenErrorModal(true);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, []);

  return (
    <MainContainer padding={20}>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={errorModalTitle}
        message={errorMessage}
        onClose={() => {
          setOpenErrorModal(false);
          setErrorMessage("");
          setErrorModalTitle("");
        }}
        onDismiss={() => {
          setOpenErrorModal(false);
          setErrorMessage("");
          setErrorModalTitle("");
        }}
      />
      {userDetails?.role === "member" ? (
        <>
          <HeaderText style={{ textAlign: "center", fontSize: 20 }}>
            Welcome to the Gym!
          </HeaderText>
          <BodyText
            style={{
              textAlign: "center",
              marginBottom: 20,
              color: colors.gray,
            }}
          >
            View your all your gym related details here.
          </BodyText>
          <View
            style={{
              marginVertical: 20,
              gap: 15,
              flex: 1,
            }}
          >
            <View
              style={{
                borderColor: colors.lightGray,
                borderWidth: 1,
                borderRadius: 6,
                padding: 15,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <HeaderText style={{ fontSize: 18 }}>Membership</HeaderText>
                <BodyText
                  style={{
                    color:
                      memberDetails?.status === "Active"
                        ? colors.success.normal
                        : colors.error.normal,
                  }}
                >
                  {memberDetails?.status}
                </BodyText>
              </View>
              <View style={{ gap: 10 }}>
                <SubHeaderText>
                  Plan: {memberDetails?.duration}{" "}
                  {memberDetails?.duration === 1 ? "month" : "months"}
                </SubHeaderText>
                <SubHeaderText>
                  From:{" "}
                  {memberDetails.renewal_date
                    ? moment(memberDetails.renewal_date).format("Do MMMM YYYY")
                    : moment(memberDetails.joined_date).format("Do MMMM YYYY")}
                </SubHeaderText>
                <SubHeaderText>
                  To:{" "}
                  {moment(memberDetails?.expiry_date).format("Do MMMM YYYY")}
                </SubHeaderText>
                <SubHeaderText>
                  Days Left:{" "}
                  {getDaysLeft(
                    memberDetails.renewal_date
                      ? memberDetails.renewal_date
                      : memberDetails.joined_date,
                    memberDetails?.expiry_date
                  )}
                </SubHeaderText>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: colors.lightGray,
                  borderRadius: 8,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    height: 75,
                    width: 75,
                    borderRadius: 8,
                    backgroundColor: colors.info.normal,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="calendar-search"
                    size={35}
                    color="white"
                  />
                </View>
                <SubHeaderText style={{ textAlign: "center" }}>
                  View workout recommendations
                </SubHeaderText>
              </View>
              <View
                style={{
                  flex: 1,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: colors.lightGray,
                  borderRadius: 8,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    height: 75,
                    width: 75,
                    borderRadius: 8,
                    backgroundColor: colors.secondary.normal,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="calendar-heart"
                    size={35}
                    color="white"
                  />
                </View>
                <SubHeaderText style={{ textAlign: "center" }}>
                  View diet plan recommendations
                </SubHeaderText>
              </View>
            </View>
            <OptionsContainer
              title="Performance Reports"
              color={colors.orange.normal}
              desc="View your performance report in the gym given by your own personal trainer."
              onPress={() => router.push("/gym/reports")}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={35}
                color="white"
              />
            </OptionsContainer>
          </View>
        </>
      ) : userDetails?.role === "trainer" ? (
        <></>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 35,
            }}
          >
            <View
              style={{
                gap: 15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 650,
              }}
            >
              <HeaderText
                style={{ width: 290, textAlign: "center", fontSize: 18 }}
              >
                Opps! Looks like you are not{"\n"} a member
              </HeaderText>
              <BodyText style={{ textAlign: "center" }}>
                Get your membership now, and enjoy a wide range of features you
                are missing out on!
              </BodyText>
            </View>
            <StyledButton
              title={"Get Membership"}
              style={{ width: "100%", alignSelf: "flex-end" }}
              onPress={() => router.push("/gym/generate")}
            ></StyledButton>
          </View>
        </>
      )}
    </MainContainer>
  );
};

export default index;
