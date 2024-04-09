import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  Modal,
} from "react-native";
import React from "react";
import useGym from "../../../hooks/useGym";
import { useEffect } from "react";
import { useState } from "react";
import MainContainer from "../../../components/MainContainer";
import ErrorModal from "../../../components/ErrorModal";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { ActivityIndicator, TouchableRipple } from "react-native-paper";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { format } from "date-fns";
import formatTime from "../../../helpers/formatDate";
import { AntDesign } from "@expo/vector-icons";
import { calculateDays } from "../../../helpers/calculateDaysLeft";
import StyledButton from "../../../components/StyledButton";
import PaymentView from "../../../components/PaymentView";
import usePay from "../../../hooks/usePay";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { useUsers } from "../../../hooks/useUsers";
const competition = () => {
  const { user } = useAuthContext();
  const decodedToken = decodeToken(user);
  const userDetails = decodedToken?.user;
  const { getCompetitions } = useGym();
  const { getUserEntries } = useUsers();
  const { onInitializePay } = usePay();
  const [competitions, setCompetitions] = useState([]);
  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [expiredCompetitions, setExpiredCompetitions] = useState([]);

  // Modal related states
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState({});

  const [uri, setUri] = useState(null);

  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Page related states
  const [isLoading, setIsLoading] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [userEntries, setuserEntries] = useState([]);

  const filterCompetitions = ({ filter, competitionsToFilter }) => {
    const currentDate = new Date();
    let filteredCompetitons;

    if (filter == "active") {
      filteredCompetitons = competitionsToFilter.filter((comp) => {
        return new Date(comp.entry_deadline) >= currentDate;
      });
    }

    if (filter == "expired") {
      filteredCompetitons = competitionsToFilter.filter((comp) => {
        return new Date(comp.entry_deadline) < currentDate;
      });
    }
    return filteredCompetitons;
  };

  const fetchCompetitions = async () => {
    setIsLoading(true);
    const response = await getCompetitions();

    if (response.success) {
      const announcements = response?.announcements;
      setCompetitions(announcements);

      setActiveCompetitions(
        filterCompetitions({
          filter: "active",
          competitionsToFilter: announcements,
        })
      );
      setExpiredCompetitions(
        filterCompetitions({
          filter: "expired",
          competitionsToFilter: announcements,
        })
      );
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response?.message);
      setModalTitle("Error fetching competitions");
    }

    setIsLoading(false);
  };

  const onPay = async ({ user_id, order_name, amount }) => {
    const response = await onInitializePay({ user_id, order_name, amount });
    console.log("🚀 ~ response:", response);

    if (response.success) {
      setUri(response?.uri);
    }
  };

  const hasUserEntered = ({ id }) =>
    userEntries.some((item) => item.fitness_competition_id === id);

  const fetchUserEntries = async () => {
    const response = await getUserEntries({ user_id: userDetails?.user_id });

    if (response.success) {
      setuserEntries(response.entries);
    } else {
      setOpenErrorModal(true);
      setErrorMessage(response.message);
      setModalTitle("Error");
    }
  };

  useEffect(() => {
    if (uri) {
      setOpenPaymentModal(true);
    }
  }, [uri]);

  useEffect(() => {
    fetchCompetitions();
    fetchUserEntries();
  }, []);
  return (
    <MainContainer padding={15}>
      <ErrorModal
        title={modalTitle}
        message={errorMessage}
        openErrorModal={openErrorModal}
        onClose={() => {
          setOpenErrorModal(false);
        }}
        onDismiss={() => {
          setOpenErrorModal(false);
        }}
      />
      <Modal
        transparent
        animationType="slide"
        visible={openDetailsModal}
        onDismiss={() => {
          setOpenDetailsModal(false);
          setSelectedAnnouncement({});
        }}
        onRequestClose={() => {
          setOpenDetailsModal(false);
          setSelectedAnnouncement({});
        }}
      >
        <View style={{ flex: 1, backgroundColor: colors.white, padding: 15 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 35,
              alignItems: "center",
            }}
          >
            <TouchableRipple
              style={{
                borderRadius: 100,
                padding: 5,
              }}
              onPress={() => {
                setOpenDetailsModal(false);
                setSelectedAnnouncement({});
              }}
            >
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableRipple>
            <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
          </View>
          <View style={{ marginTop: 15 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <HeaderText style={{ fontSize: 18, flex: 1 }}>
                {selectedAnnouncement?.title}
              </HeaderText>
              {selectedAnnouncement &&
              new Date(selectedAnnouncement.start_date) < 0 ? (
                <BodyText style={{ color: colors.error.normal }}>
                  Expired
                </BodyText>
              ) : (
                <BodyText style={{ color: colors.success.dark }}>
                  {selectedAnnouncement &&
                    calculateDays(
                      new Date(selectedAnnouncement.start_date)
                    )}{" "}
                  days left
                </BodyText>
              )}
            </View>
            <View style={{ gap: 15, flexDirection: "row" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <MaterialIcons
                  name="access-time"
                  size={24}
                  color={colors.gray}
                />
                <BodyText style={{ color: colors.gray }}>
                  {formatTime(selectedAnnouncement?.start_time)}
                </BodyText>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Feather name="calendar" size={24} color={colors.gray} />
                <BodyText style={{ color: colors.gray }}>
                  {selectedAnnouncement?.start_date &&
                    format(
                      new Date(selectedAnnouncement?.start_date),
                      "d MMM yyy"
                    )}
                </BodyText>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <View style={{ marginVertical: 15 }}>
              <BodyText style={{ fontSize: 16, marginBottom: 20 }}>
                {selectedAnnouncement?.description}
              </BodyText>
              <View style={{ gap: 10 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <FontAwesome5
                    name="money-bill-wave"
                    size={20}
                    color={colors.success.dark}
                    style={{ marginRight: 5 }}
                  />
                  <BodyText style={{ fontSize: 16, marginBottom: 5 }}>
                    Entry Fee: Rs{" "}
                    {parseFloat(selectedAnnouncement?.entry_fee).toFixed()}
                  </BodyText>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <MaterialCommunityIcons
                    name="medal-outline"
                    size={20}
                    color={colors.warning.normal}
                    style={{ marginRight: 10 }}
                  />
                  <BodyText style={{ fontSize: 16, marginBottom: 5 }}>
                    Prize: Rs. {parseFloat(selectedAnnouncement?.prize_amount)}
                  </BodyText>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Ionicons
                    name="ticket-outline"
                    size={20}
                    color={colors.error.normal}
                    style={{ marginRight: 10 }}
                  />
                  <BodyText style={{ fontSize: 16, marginBottom: 5 }}>
                    No. of Entries: {selectedAnnouncement?.entries}
                  </BodyText>
                </View>
              </View>
            </View>
            <StyledButton
              isDisabled={hasUserEntered({
                id: selectedAnnouncement?.fitness_competition_id,
              })}
              style={{ alignSelf: "flex-end" }}
              title={
                hasUserEntered({
                  id: selectedAnnouncement?.fitness_competition_id,
                })
                  ? `Paid`
                  : `Pay Rs. ${parseFloat(
                      selectedAnnouncement?.entry_fee
                    ).toFixed()}`
              }
              onPress={() =>
                onPay({
                  amount: selectedAnnouncement?.entry_fee,
                  order_name: selectedAnnouncement?.title,
                  user_id: userDetails?.user_id,
                })
              }
            ></StyledButton>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" visible={openPaymentModal}>
        <PaymentView
          uri={uri}
          onClose={() => {
            setUri(null);
            setOpenPaymentModal(false);
            fetchUserEntries();
          }}
        />
      </Modal>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <View>
          <HeaderText style={{ fontSize: 18 }}>Active Competitions</HeaderText>
          {activeCompetitions.length > 0 ? (
            <FlatList
              data={filterCompetitions({
                filter: "active",
                competitionsToFilter: competitions,
              })}
              renderItem={(comp) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setOpenDetailsModal(true);
                    setSelectedAnnouncement(comp.item);
                  }}
                  key={comp.index}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <HeaderText>{comp.item.title}</HeaderText>
                    <SubHeaderText style={{ color: colors.primary.normal }}>
                      Rs. {parseInt(comp.item.entry_fee ?? 0).toFixed()}
                    </SubHeaderText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 15,
                    }}
                  >
                    <MaterialIcons
                      name="access-time"
                      size={20}
                      color={colors.gray}
                    />
                    <BodyText style={{ color: colors.gray }}>
                      {formatTime(comp.item.start_time)}
                    </BodyText>
                    <Feather name="calendar" size={20} color={colors.gray} />
                    <BodyText style={{ color: colors.gray }}>
                      {format(new Date(comp.item.start_date), "d MMM yyy")}
                    </BodyText>
                  </View>
                  <BodyText
                    style={{ color: colors.gray, marginBottom: 15 }}
                    ellipsis={"tail"}
                    numOfLines={3}
                  >
                    {comp.item.description}
                  </BodyText>

                  <BodyText
                    style={{
                      fontStyle: "italic",
                      fontSize: 12,
                      color: colors.gray,
                    }}
                  >
                    Posted:{" "}
                    {format(
                      new Date(comp.item.posted_date),
                      "d MMMM yyyy, hh:mm a"
                    )}
                  </BodyText>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View
              style={{
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BodyText style={{ textAlign: "center" }}>
                No active competitions.
              </BodyText>
            </View>
          )}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => setShowExpired(!showExpired)}
          >
            <HeaderText style={{ fontSize: 18 }}>
              Expired Competitions ({expiredCompetitions.length})
            </HeaderText>
            {showExpired ? (
              <MaterialCommunityIcons
                name="chevron-up"
                size={24}
                color="black"
              />
            ) : (
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="black"
              />
            )}
          </Pressable>
          {showExpired && (
            <FlatList
              data={expiredCompetitions}
              renderItem={(comp) => (
                <View
                  key={comp.index}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <HeaderText>{comp.item.title}</HeaderText>
                  <BodyText style={{ color: colors.gray }}>
                    Price: Rs {comp.item.entry_fee}
                  </BodyText>
                  <BodyText style={{ color: colors.gray }}>
                    Start Date: {comp.item.start_date}
                  </BodyText>
                  <BodyText style={{ color: colors.gray }}>
                    Entry Deadline: {comp.item.entry_deadline}
                  </BodyText>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </MainContainer>
  );
};

export default competition;
