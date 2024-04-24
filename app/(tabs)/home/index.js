import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import CircularProgress from "react-native-circular-progress-indicator";
import stepsImage from "../../../assets/images/steps.png";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { router, useFocusEffect } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import AccountContainer from "../../../components/AccountContainer";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useFood from "../../../hooks/useFood";
import useHealthData from "../../../hooks/useHealthData";
import { AntDesign } from "@expo/vector-icons";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
import StyledDatePicker from "../../../components/StyledDatePicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import InputFields from "../../../components/InputFields";
import StyledButton from "../../../components/StyledButton";
import { useUsers } from "../../../hooks/useUsers";
import { format, formatDate } from "date-fns";
import useDecode from "../../../hooks/useDecode";
import Animated, { FadeInDown } from "react-native-reanimated";
import { requestPermission } from "react-native-health-connect";

const index = () => {
  const { user } = useAuthContext();
  const { getLoggedFood } = useFood();
  const { getAndroidData } = useHealthData();
  const { getWeightLogs, logWeight, logSteps } = useUsers();

  const [mealTotals, setMealTotals] = useState(null);

  const [isHealthDataGranted, setIsHealthDataGranted] = useState(false);

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const { getDecodedToken } = useDecode();
  const [ishealthDataLoading, setIshealthDataLoading] = useState(true);

  const [openWeightModal, setOpenWeightModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [weight, setWeight] = useState("");

  const [logDate, setLogDate] = useState(new Date());

  const [openDatePicker, setOpenDatePicker] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  const [isWeightInvalid, setIsWeightInvalid] = useState(false);
  const [invalidWeightMessage, setInvalidWeightMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState(null);

  const [weightLogs, setWeightLogs] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  const [date, setDate] = useState(new Date());
  const [totalCalorieIntake, setTotalCalorieIntake] = useState(0);

  const [appPresent, setAppPresent] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [openPermissionInfoModal, setOpenPermissionInfoModal] = useState(false);
  const [openAppInfoModal, setOpenAppInfoModal] = useState(false);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();
      if (response.success) {
        setCurrentUser(response?.user);
        setIsPageLoading(false);
      }
    };

    fetchDecodedToken();
  }, [user]);

  // Change Time
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  // Calorie intake related functions

  const fetchCalorieIntake = async () => {
    if (currentUser) {
      const date = formatDate(new Date(), "yyyy-MM-dd");

      const response = await getLoggedFood({
        user_id: currentUser?.user_id,
        date: date,
      });

      const mealTotals = response.data.mealTotals;

      if (response.success) {
        const totalCalories = mealTotals.reduce(
          (total, meal) => (total += parseFloat(meal.total_calories)),
          0
        );

        setMealTotals(mealTotals);
        setTotalCalorieIntake(totalCalories);
      }
    }
  };

  // Health data related functions

  const onLogSteps = async ({ steps }) => {
    if (currentUser) {
      if (!steps) {
        return;
      }

      await logSteps({
        user_id: currentUser?.user_id,
        steps: steps,
      });
    }
  };

  const fetchHealthData = async () => {
    if (currentUser) {
      setIshealthDataLoading(true);
      const values = await getAndroidData();

      if (values.success) {
        onLogSteps({ steps: values.totalSteps });
        setCalories(values.totalCalories);
        setSteps(values.totalSteps);
        setIsHealthDataGranted(true);
        setAppPresent(true);
        setPermissionGranted(true);
      } else {
        setIsHealthDataGranted(false);

        if (!values.appPresent) {
          setAppPresent(false);
        } else if (!values.permission) {
          setAppPresent(true);
          setPermissionGranted(false);
        } else {
          return;
        }
        setIshealthDataLoading(false);
      }
    }
  };

  const onOpenInfoModal = () => {
    if (!appPresent) {
      setOpenAppInfoModal(true);
    } else if (!permissionGranted) {
      setOpenPermissionInfoModal(true);
    } else {
      return;
    }
  };

  // Weight log related functions

  const fetchWeightLogs = async () => {
    if (currentUser) {
      const response = await getWeightLogs({
        user_id: currentUser?.user_id,
        range: 90,
      });
      if (response.success) {
        const logs = response?.logs;

        const data = logs.map((log) => ({
          value: log.weight,
          date: format(new Date(log.log_date), "dd MMM yyyy"),
          label: `${format(new Date(log.log_date), "d MMM")}`,
        }));
        setLineChartData(data);
        setWeightLogs(response.logs);
      }
    }
  };

  const onLogWeight = async () => {
    setResponseMessage("");
    setInvalidWeightMessage("");
    setIsWeightInvalid(false);
    setIsLoading(true);
    setIsDisabled(true);
    if (!weight || weight == "") {
      setIsWeightInvalid(true);
      setInvalidWeightMessage("This field is required.");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    const response = await logWeight({
      user_id: currentUser?.user_id,
      weight: weight,
      date: logDate,
    });
    console.log("🚀 ~ logDate:", logDate);

    if (response.success) {
      setOpenToast(true);
      setToastMessage(response?.message);
      setToastType("success");
      setTimeout(() => {
        setOpenToast(false);
        setToastMessage("");
        setToastType("");
      }, 1500);

      setWeight("");
      setDate(new Date());
      setResponseMessage("");
      setIsWeightInvalid(false);
      setInvalidWeightMessage("");
      fetchWeightLogs();
      setOpenWeightModal(false);
    } else {
      setResponseMessage(response?.message);
    }

    setIsLoading(false);
    setIsDisabled(false);
  };

  useEffect(() => {
    fetchWeightLogs();
  }, [currentUser, openWeightModal]);

  useFocusEffect(
    useCallback(() => {
      fetchCalorieIntake();
      fetchHealthData();
    }, [currentUser])
  );

  // Change date staate when selecting a new date

  const onDateChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      console.log("🚀 ~ selectedDate:", selectedDate);

      if (Platform.OS === "android") {
        setOpenDatePicker(false);
        setLogDate(currentDate);
      }
    } else {
      setOpenDatePicker(false);
    }
  };

  const openPermissionScreen = async () => {
    const permissionGranted = await requestPermission(
      [
        { accessType: "read", recordType: "TotalCaloriesBurned" },
        { accessType: "read", recordType: "Steps" },
      ],
      "com.google.android.apps.healthdata"
    );

    if (permissionGranted.length === 2) {
      fetchHealthData();
      setOpenPermissionInfoModal(false);
    }
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
        <SafeAreaView>
          <Modal
            transparent
            animationType="fade"
            visible={openWeightModal}
            onRequestClose={() => {
              setOpenWeightModal(false);
              setResponseMessage("");
              setWeight("");
            }}
            onDismiss={() => {
              setOpenWeightModal(false);
              setWeight("");
              setResponseMessage("");
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
              }}
            >
              <View
                style={{
                  minHeight: 200,
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  width: "100%",
                  padding: 15,
                }}
              >
                <HeaderText>Add Weight</HeaderText>
                <BodyText
                  style={{ textAlign: "center", color: colors.error.normal }}
                >
                  {responseMessage}
                </BodyText>
                <StyledDatePicker
                  title="Date"
                  placeholder={"Date"}
                  value={format(new Date(logDate), "yyyy-MM-dd")}
                  onPress={() => setOpenDatePicker(true)}
                  isEditable={false}
                />
                {openDatePicker && (
                  <DateTimePicker
                    mode="date"
                    display="spinner"
                    value={logDate}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
                {openDatePicker && Platform.OS === "ios" && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }}
                  >
                    <Pressable onPress={() => setOpenDatePicker(false)}>
                      <HeaderText>Cancel</HeaderText>
                    </Pressable>
                    <StyledButton
                      style={{ width: "50%" }}
                      title={"Confirm"}
                      onPress={onIOSDateConfrim}
                    ></StyledButton>
                  </View>
                )}
                <View style={{ marginBottom: 15 }}></View>

                <InputFields
                  value={weight}
                  onChangeText={(e) => setWeight(e)}
                  placeholder={"Enter weight in kg"}
                  type={"numeric"}
                  title={"Weight"}
                  isInvalid={isWeightInvalid}
                  errorText={invalidWeightMessage}
                />

                <View style={{ marginBottom: 15 }}></View>

                <StyledButton
                  title={"Add"}
                  onPress={onLogWeight}
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                />
              </View>
            </View>
          </Modal>
          <Modal
            transparent
            animationType="fade"
            visible={openPermissionInfoModal}
            onDismiss={() => setOpenPermissionInfoModal(false)}
            onRequestClose={() => setOpenPermissionInfoModal(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 15,
                  backgroundColor: colors.white,
                  width: "100%",
                  borderRadius: 8,
                  gap: 15,
                }}
              >
                <HeaderText>Permission Requirement</HeaderText>
                <BodyText>
                  Uthau needs permission for this feature. Please enable it from
                  health connect.
                </BodyText>
                <HeaderText>Additional Steps</HeaderText>
                <BodyText>
                  1. Make sure to connect your smart watch's app to health
                  connect.
                </BodyText>
                <BodyText>
                  2. If health connect directly doen't support your smart
                  watch's app, try linking it to Google fit first and then
                  connect Google Fit to health connect if you haven't already.
                </BodyText>
                <BodyText>
                  Note: Some apps supported by Health Connect: Google Fit,
                  Fitbit, OnHealth, etc.
                </BodyText>

                <StyledButton
                  onPress={openPermissionScreen}
                  title={"Grant Permissions"}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <BodyText
                    style={{
                      fontSize: 10,
                    }}
                  >
                    Nothing happening? Make sure Health Connect is installed.
                  </BodyText>
                  <Pressable
                    onPress={() => {
                      Linking.openURL(
                        "market://details?id=com.google.android.apps.healthdata"
                      );
                      setOpenPermissionInfoModal(false);
                    }}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <BodyText
                      style={{ color: colors.info.normal, fontSize: 10 }}
                    >
                      Click Here
                    </BodyText>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            transparent
            animationType="fade"
            visible={openAppInfoModal}
            onDismiss={() => setOpenAppInfoModal(false)}
            onRequestClose={() => setOpenAppInfoModal(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 15,
                  backgroundColor: colors.white,
                  width: "100%",
                  borderRadius: 8,
                  gap: 15,
                }}
              >
                <HeaderText>Health Connect Requirement</HeaderText>
                <BodyText>
                  The Health Connect app is required for this feature. Please
                  install it from the Playstore.
                </BodyText>
                <StyledButton
                  onPress={() => {
                    Linking.openURL(
                      "market://details?id=com.google.android.apps.healthdata"
                    );
                    setOpenAppInfoModal(false);
                  }}
                  title={"Open Playstore"}
                />
              </View>
            </View>
          </Modal>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={{ paddingTop: 15 }}
          >
            <Animated.View
              entering={FadeInDown}
              style={{
                paddingHorizontal: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AccountContainer
                size={40}
                imageURI={currentUser?.image}
                onPress={() => router.push("/home/account")}
              />
            </Animated.View>

            <MainContainer gap={25} padding={15}>
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
              <Animated.View
                entering={FadeInDown}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <HeaderText
                  style={{
                    fontSize: 18,
                  }}
                >
                  Hello, {currentUser.name?.split(" ")[0]}
                </HeaderText>
                <View>
                  <HeaderText
                    style={{
                      fontSize: 18,
                      textAlign: "right",
                    }}
                  >
                    {formatDate(date, "hh:mm aa")}
                  </HeaderText>
                  <BodyText style={{ color: colors.gray }}>
                    {formatDate(date, "E, MMMM d yyyy")}
                  </BodyText>
                </View>
              </Animated.View>

              {/* Calories Container */}
              <View>
                <Animated.View
                  entering={FadeInDown}
                  style={{
                    padding: 15,
                    borderRadius: 6,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: "#e3e3e3",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <HeaderText style={{ fontSize: 18, marginBottom: 5 }}>
                      Calories
                    </HeaderText>
                    <LinkText href="/diary" style={{ paddingBottom: 10 }}>
                      View Details
                    </LinkText>
                  </View>
                  {currentUser?.role !== "trainer" ? (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <CircularProgress
                          value={
                            totalCalorieIntake <= currentUser?.calorie_intake
                              ? totalCalorieIntake
                              : currentUser?.calorie_intake
                          }
                          maxValue={currentUser?.calorie_intake}
                          radius={78}
                          activeStrokeColor={colors.primary.normal}
                          inActiveStrokeColor={colors.primary.dark}
                          inActiveStrokeOpacity={0.2}
                          inActiveStrokeWidth={12}
                          activeStrokeWidth={17}
                          title="Completed"
                          titleColor={colors.black}
                          titleStyle={{
                            color: "gray",
                            fontSize: 14,
                            fontFamily: "Figtree",
                          }}
                          progressValueStyle={{
                            color: colors.black,
                            fontSize: 28,
                            fontFamily: "Poppins-Bold",
                          }}
                        />
                      </View>
                      <View
                        style={{
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Feather name="target" size={25} color="red" />
                          <SubHeaderText style={{ fontSize: 18 }}>
                            Daily Goal:
                          </SubHeaderText>
                        </View>
                        <HeaderText style={{ fontSize: 32 }}>
                          {currentUser.calorie_intake?.toLocaleString()}
                        </HeaderText>
                      </View>
                    </View>
                  ) : (
                    <BodyText style={{ textAlign: "center" }}>
                      {totalCalorieIntake} kcals completed
                    </BodyText>
                  )}
                </Animated.View>
              </View>
              {/* Steps and Calories card */}

              <Animated.View entering={FadeInDown}>
                {isHealthDataGranted ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View
                      style={{
                        backgroundColor: colors.secondary.normal,
                        flex: 1,
                        borderRadius: 10,
                        padding: 15,
                      }}
                    >
                      <View style={{ alignItems: "flex-end" }}>
                        <Image source={stepsImage} width={60} height={60} />
                      </View>
                      <View>
                        <SubHeaderText
                          style={{ color: colors.white, fontSize: 18 }}
                        >
                          Steps
                        </SubHeaderText>
                        <HeaderText
                          style={{ color: colors.white, fontSize: 32 }}
                        >
                          {steps}
                        </HeaderText>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.warning.normal,
                        flex: 1,
                        borderRadius: 10,
                        padding: 15,
                      }}
                    >
                      <View style={{ alignItems: "flex-end" }}>
                        <FontAwesome5
                          name="fire-alt"
                          size={60}
                          color={colors.white}
                        />
                      </View>
                      <View>
                        <SubHeaderText
                          style={{ color: colors.white, fontSize: 18 }}
                        >
                          Calories
                        </SubHeaderText>
                        <HeaderText
                          style={{ color: colors.white, fontSize: 32 }}
                        >
                          {calories}
                        </HeaderText>
                      </View>
                    </View>
                  </View>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                      }}
                    >
                      <Pressable
                        style={{
                          backgroundColor: colors.secondary.normal,
                          flex: 1,
                          borderRadius: 10,
                          padding: 15,
                          width: "100%",
                        }}
                        onPress={onOpenInfoModal}
                      >
                        <View style={{ alignItems: "flex-end" }}>
                          <Image source={stepsImage} width={60} height={60} />
                        </View>
                        <View>
                          <SubHeaderText
                            style={{ color: colors.white, fontSize: 18 }}
                          >
                            Steps
                          </SubHeaderText>
                          <HeaderText style={{ color: colors.white }}>
                            Connect to track {"\n"} steps
                          </HeaderText>
                        </View>
                      </Pressable>
                      <Pressable
                        style={{
                          backgroundColor: colors.warning.normal,
                          flex: 1,
                          borderRadius: 10,
                          padding: 15,
                          width: "100%",
                        }}
                        onPress={onOpenInfoModal}
                      >
                        <View style={{ alignItems: "flex-end" }}>
                          <FontAwesome5
                            name="fire-alt"
                            size={60}
                            color={colors.white}
                          />
                        </View>
                        <View>
                          <SubHeaderText
                            style={{ color: colors.white, fontSize: 18 }}
                          >
                            Calories
                          </SubHeaderText>
                          <HeaderText style={{ color: colors.white }}>
                            Connect to track calories
                          </HeaderText>
                        </View>
                      </Pressable>
                    </View>
                  </>
                )}
              </Animated.View>

              {/* Progress */}

              <Animated.View
                entering={FadeInDown}
                style={{
                  borderWidth: 1,
                  borderColor: "#e3e3e3",
                  padding: 15,
                  borderRadius: 10,
                  gap: 15,
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <HeaderText style={{ fontSize: 18 }}>Progress</HeaderText>
                  <TouchableRipple
                    style={{ padding: 5, borderRadius: 16 }}
                    onPress={() => setOpenWeightModal(true)}
                  >
                    <AntDesign name="plus" size={24} color="black" />
                  </TouchableRipple>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <SubHeaderText>Weight</SubHeaderText>
                  <BodyText style={{ color: colors.gray }}>
                    Last 90 Days
                  </BodyText>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 15,
                  }}
                >
                  {weightLogs.length > 0 ? (
                    <LineChart
                      areaChart
                      isAnimated
                      hideDataPoints
                      rulesType="solid"
                      rulesColor={colors.lightWhite}
                      data={lineChartData}
                      startFillColor={colors.primary.normal}
                      startOpacity={0.8}
                      endOpacity={0.2}
                      width={screenWidth - 130}
                      noOfSections={6}
                      yAxisTextStyle={{ color: colors.gray, fontSize: 10 }}
                      xAxisLabelTextStyle={{ color: colors.gray, fontSize: 8 }}
                      xAxisColor={colors.lightGray}
                      yAxisColor={colors.lightGray}
                      pointerConfig={{
                        pointerStripColor: colors.primary.light,
                        pointerColor: colors.primary.dark,
                        pointerLabelComponent: (items) => {
                          return (
                            <View
                              style={{
                                height: 90,
                                width: 100,
                                justifyContent: "center",
                                marginTop: 10,
                                marginLeft: -40,
                              }}
                            >
                              <View
                                style={{
                                  paddingHorizontal: 14,
                                  paddingVertical: 6,
                                  borderRadius: 16,
                                  backgroundColor: colors.white,
                                }}
                              >
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  {items[0].value + " kg"}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontSize: 14,
                                  marginBottom: 6,
                                  textAlign: "center",
                                }}
                              >
                                {items[0].date}
                              </Text>
                            </View>
                          );
                        },
                      }}
                    />
                  ) : (
                    <HeaderText>No records found.</HeaderText>
                  )}
                </View>
              </Animated.View>
            </MainContainer>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

export default index;
