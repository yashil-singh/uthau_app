import {
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import StyledButton from "../../../components/StyledButton";
import { colors } from "../../../helpers/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OptionsContainer from "../../../components/OptionsContainer";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import useGym from "../../../hooks/useGym";
import ErrorModal from "../../../components/ErrorModal";
import getDaysLeft from "../../../helpers/getDaysLeft";
import useDecode from "../../../hooks/useDecode";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "react-native-vector-icons";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
import DropdownPicker from "../../../components/DropdownPicker";
import { formatDate } from "date-fns";
import InputFields from "../../../components/InputFields";

const index = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);

  const { getMemberById, getTrainerAssignments, getMetrics, onEvaluateMember } =
    useGym();
  const { getDecodedToken } = useDecode();

  const [memberDetails, setMemberDetails] = useState({});
  const [trainerAssignments, setTrainerAssignments] = useState([]);

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorModalTitle, setErrorModalTitle] = useState("");

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isMemberShipActive, setIsMemberShipActive] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  const [openEvaluateModal, setOpenEvaluateModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onEvaluateModalClose = () => {
    setOpenEvaluateModal(false);
  };

  const grades = [
    {
      label: "",
      value: null,
    },
    {
      label: "A",
      value: "A",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "C",
      value: "C",
    },
    {
      label: "D",
      value: "D",
    },
    {
      label: "E",
      value: "E",
    },
    {
      label: "F",
      value: "F",
    },
  ];

  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const fetchMemberDetails = async () => {
    if (currentUser) {
      if (currentUser?.role === "member") {
        const response = await getMemberById({ user_id: currentUser?.user_id });
        console.log("🚀 ~ response:", response);

        if (response.success) {
          if (!response.member) {
            return;
          }
          setMemberDetails(response.member);
          if (response.member.status === "Active") {
            setIsMemberShipActive(true);
          }
        } else {
          setErrorMessage(response.message);
          setErrorModalTitle("Error fetching member details.");
          setOpenErrorModal(true);
        }
      }
      setIsPageLoading(false);
    }
  };

  const fetchTrainerAssignments = async () => {
    if (currentUser && currentUser?.role === "trainer") {
      setIsLoading(true);
      const response = await getTrainerAssignments({
        user_id: currentUser?.user_id,
      });

      if (response.success) {
        setTrainerAssignments(response.data);
      }
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (currentUser && currentUser?.role === "trainer") {
      const response = await getMetrics();

      if (response.success) {
        setMetrics(response.data);
      } else {
        setSelectedMember(null);
        setToastMessage(response?.message);
      }

      setIsPageLoading(false);
    }
  };

  const [selectedGrades, setSelectedGrades] = useState({});
  const [note, setNote] = useState("");

  const handleGradeChange = (metrics_id, value) => {
    setSelectedGrades((prevState) => {
      if (!value) {
        const newState = { ...prevState };
        delete newState[metrics_id];
        return newState;
      }

      return {
        ...prevState,
        [metrics_id]: value,
      };
    });
  };

  const submitEvaluation = async () => {
    setErrorMessage("");
    const response = await onEvaluateMember({
      trainer_id: currentUser?.user_id,
      member_id: selectedMember?.member_id,
      grades: selectedGrades,
      note: note,
    });

    if (response.success) {
      setOpenEvaluateModal(false);
      setTimeout(() => {
        setOpenToast(true);
      }, 500);
      setToastMessage(response?.message);
      setSelectedGrades({});
      setNote("");
      setSelectedMember(null);
    } else {
      setErrorMessage(response.message);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
    fetchTrainerAssignments();
    fetchMetrics();
  }, [currentUser]);

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

      <Modal
        animationType="slide"
        onDismiss={onEvaluateModalClose}
        onRequestClose={onEvaluateModalClose}
        visible={openEvaluateModal}
      >
        <View style={{ flex: 1, padding: 15 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 30,
            }}
          >
            <TouchableRipple
              borderless
              onPress={() => {
                setOpenEvaluateModal(false);
                setSelectedGrades({});
              }}
              style={{ borderRadius: 100, padding: 5 }}
            >
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableRipple>
            <HeaderText style={{ fontSize: 24 }}>Evaluate</HeaderText>
          </View>
          <View style={{ gap: 5, marginBottom: 15 }}>
            <HeaderText>Member Details</HeaderText>
            <BodyText>Full Name: {selectedMember?.name}</BodyText>
            <BodyText>Phone: {selectedMember?.phone}</BodyText>
            {/* <BodyText style={{ marginBottom: 15 }}>
              Joined Date:{" "}
              {selectedMember &&
                format(new Date(selectedMember?.joined_date), "do MMMM yyyy")}
            </BodyText> */}

            <InputFields
              title={"Note"}
              isMultiline={true}
              numberOfLines={6}
              placeholder={"Enter something"}
              value={note}
              onChangeText={(e) => setNote(e)}
            />
          </View>

          <BodyText
            style={{
              color: colors.error.normal,
              textAlign: "center",
              marginBottom: 15,
            }}
          >
            {errorMessage}
          </BodyText>

          <FlatList
            data={metrics}
            showsVerticalScrollIndicator={false}
            renderItem={({ index, item }) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <HeaderText style={{ marginTop: 15 }}>
                  {item.metric_name}
                </HeaderText>
                <DropdownPicker
                  options={grades}
                  style={{ width: 80 }}
                  placeholder={""}
                  value={selectedGrades[item.metrics_id]}
                  onChange={(e) => handleGradeChange(item.metrics_id, e.value)}
                />
              </View>
            )}
            ListEmptyComponent={() => (
              <HeaderText>No metrics found.</HeaderText>
            )}
            ListFooterComponent={() => (
              <StyledButton
                title={"Submit"}
                style={{
                  width: "100%",
                }}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                onPress={submitEvaluation}
              />
            )}
            ListFooterComponentStyle={{ marginTop: 25 }}
          />
        </View>
      </Modal>
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : currentUser?.role === "member" ? (
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
            <Animated.View
              entering={FadeInDown}
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
                  {memberDetails && memberDetails.renewal_date
                    ? formatDate(
                        new Date(memberDetails.renewal_date),
                        "do MMMM yyyy"
                      )
                    : formatDate(
                        new Date(memberDetails.joined_date),
                        "do MMMM yyyy"
                      )}
                </SubHeaderText>
                <SubHeaderText>
                  To:{" "}
                  {memberDetails &&
                    formatDate(
                      new Date(memberDetails?.expiry_date),
                      "do MMMM yyyy"
                    )}
                </SubHeaderText>
                <SubHeaderText>
                  Days Left:{" "}
                  {getDaysLeft(
                    memberDetails.renewal_date
                      ? memberDetails.renewal_date
                      : memberDetails.joined_date,
                    memberDetails?.expiry_date
                  ) <= 0
                    ? 0
                    : getDaysLeft(
                        memberDetails.renewal_date
                          ? memberDetails.renewal_date
                          : memberDetails.joined_date,
                        memberDetails?.expiry_date
                      )}
                </SubHeaderText>
              </View>
            </Animated.View>

            {isMemberShipActive ? (
              <>
                <Animated.View
                  style={{ flexDirection: "row", gap: 10 }}
                  entering={FadeInDown}
                >
                  <Pressable
                    style={{
                      flex: 1,
                      padding: 15,
                      borderWidth: 1,
                      borderColor: colors.lightGray,
                      borderRadius: 8,
                      alignItems: "center",
                      gap: 8,
                    }}
                    onPress={() => router.push("/gym/exercises")}
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
                  </Pressable>
                  <Pressable
                    style={{
                      flex: 1,
                      padding: 15,
                      borderWidth: 1,
                      borderColor: colors.lightGray,
                      borderRadius: 8,
                      alignItems: "center",
                      gap: 8,
                    }}
                    onPress={() => router.push("/gym/diet")}
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
                  </Pressable>
                </Animated.View>
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
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: "flex-end", gap: 20 }}>
                <BodyText style={{ textAlign: "center" }}>
                  Please renew your membership
                </BodyText>
                <StyledButton title={"Renew"} />
              </View>
            )}
          </View>
        </>
      ) : currentUser?.role === "trainer" ? (
        <>
          <View style={{ flex: 1 }}>
            <HeaderText>Welcom back trainer!</HeaderText>
            <BodyText style={{ color: colors.gray, marginBottom: 15 }}>
              Evaluate your students based on their performance in the gym every
              month. These feedbacks are valuable to them.
            </BodyText>
            <HeaderText>Your students ({trainerAssignments.length})</HeaderText>

            {isLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator
                  color={colors.primary.normal}
                  size={"large"}
                />
              </View>
            ) : trainerAssignments.length == 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <HeaderText style={{ fontSize: 20 }}>
                  Oops! Its a bit empty here.
                </HeaderText>
                <BodyText style={{ color: colors.gray }}>
                  Looks like you are not assigned anyone
                </BodyText>
              </View>
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={trainerAssignments}
                renderItem={({ index, item }) => (
                  <View
                    key={index}
                    style={{
                      padding: 15,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.lightGray,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <HeaderText>{item.name}</HeaderText>
                      <BodyText>{item.phone}</BodyText>
                    </View>
                    <StyledButton
                      title={"Evaluate"}
                      onPress={() => {
                        setOpenEvaluateModal(true);
                        setSelectedMember(item);
                      }}
                    />
                  </View>
                )}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <HeaderText
                  style={{ width: 290, textAlign: "center", fontSize: 18 }}
                >
                  Opps! Looks like you are not{"\n"} a member
                </HeaderText>
                <BodyText style={{ textAlign: "center" }}>
                  Get your membership now, and enjoy a wide range of features
                  you are missing out on!
                </BodyText>
              </View>
            </View>
            <View
              style={{
                display: "flex",
                gap: 15,
                justifyContent: "flex-end",
              }}
            >
              <StyledButton
                title={"Get Membership"}
                style={{ width: "100%" }}
                onPress={() => router.push("/gym/payment")}
              ></StyledButton>
              <BodyText style={{ textAlign: "center" }}>OR</BodyText>
              <LinkText style={{ textAlign: "center" }} href={"/gym/generate"}>
                Already have a member code? Click here.
              </LinkText>
            </View>
          </View>
        </>
      )}
    </MainContainer>
  );
};

export default index;
