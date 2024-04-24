import {
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
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
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
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
import { useUsers } from "../../../hooks/useUsers";
import useDecode from "../../../hooks/useDecode";
const competition = () => {
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
  const { getCompetitions } = useGym();
  const { getUserEntries } = useUsers();
  const { onInitializePay, onPayCompetitionEntry } = usePay();
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
        return (
          new Date(comp.entry_deadline) >=
          new Date(currentDate.setHours(0, 0, 0, 0))
        );
      });
    }

    if (filter == "expired") {
      filteredCompetitons = competitionsToFilter.filter((comp) => {
        return (
          new Date(comp.entry_deadline) <
          new Date(currentDate).setHours(0, 0, 0, 0)
        );
      });
    }
    return filteredCompetitons;
  };

  const fetchCompetitions = async () => {
    setIsLoading(true);
    setIsRefreshing(true);

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
    setIsRefreshing(false);
  };

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isPayLodaing, setIsPayLodaing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onPay = async ({
    fitness_competition_id,
    user_id,
    order_name,
    amount,
  }) => {
    setIsLoading(true);

    const initialize = await onPayCompetitionEntry({
      amount,
      fitness_competition_id,
      order_name,
      user_id,
    });

    if (initialize.success) {
      const order_id = initialize.order_id;

      const response = await onInitializePay({ order_id });

      if (response.success) {
        setUri(response?.uri);
      } else {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
        setModalTitle("Error processing payment");
      }
    } else {
      setOpenErrorModal(true);
      setErrorMessage(initialize.message);
      setModalTitle("Error initializing payment");
    }

    setIsLoading(false);
  };

  const hasUserEntered = ({ id }) => {
    return userEntries.some((item) => item.fitness_competition_id === id);
  };

  const fetchUserEntries = async () => {
    if (currentUser) {
      const response = await getUserEntries({ user_id: currentUser?.user_id });

      if (response.success) {
        setuserEntries(response.entries);
      } else {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
        setModalTitle("Error");
      }
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
  }, [currentUser, openPaymentModal]);
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
          setToastMessage("");
        }}
        onRequestClose={() => {
          setOpenDetailsModal(false);
          setSelectedAnnouncement({});
          setToastMessage("");
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
              borderless
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
            <BodyText
              style={{ textAlign: "center", color: colors.error.normal }}
            >
              {toastMessage}
            </BodyText>
            <StyledButton
              isDisabled={hasUserEntered({
                id: selectedAnnouncement?.fitness_competition_id,
              })}
              isLoading={isPayLodaing}
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
                  user_id: currentUser?.user_id,
                  fitness_competition_id:
                    selectedAnnouncement?.fitness_competition_id,
                })
              }
            ></StyledButton>
          </View>
        </View>
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
      </Modal>
      <Modal animationType="slide" visible={openPaymentModal}>
        <PaymentView
          uri={uri}
          onClose={() => {
            setUri(null);
            setOpenPaymentModal(false);
            fetchUserEntries();
          }}
          onPaymentSuccess={() => {
            setOpenPaymentModal(false);
            setUri(null);
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
              onRefresh={() => fetchCompetitions()}
              refreshing={isRefreshing}
              data={filterCompetitions({
                filter: "active",
                competitionsToFilter: competitions,
              })}
              style={{
                gap: 15,
              }}
              renderItem={(comp) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setOpenDetailsModal(true);
                    setSelectedAnnouncement(comp.item);
                    setToastMessage("");
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
                      {format(new Date(comp.item.start_date), "do MMM yyy")}
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
                      "do MMMM yyyy, hh:mm a"
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
        </View>
      )}
    </MainContainer>
  );
};

export default competition;
