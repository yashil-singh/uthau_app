import { Feather, FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
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
import { format } from "date-fns";
import useDecode from "../../../hooks/useDecode";
import Toast from "../../../components/Toast";
import Animated, { FadeInDown } from "react-native-reanimated";
import useGym from "../../../hooks/useGym";
import { calculateDays } from "../../../helpers/calculateDaysLeft";

const index = () => {
  const { user } = useAuthContext();
  const { getLoggedFood } = useFood();
  const { getAndroidData } = useHealthData();
  const { getWeightLogs, logWeight, logSteps } = useUsers();

  const [mealTotals, setMealTotals] = useState(null);
  const currentDate = dayjs();

  const [isHealthDataGranted, setIsHealthDataGranted] = useState(false);

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const { getDecodedToken } = useDecode();
  const [ishealthDataLoading, setIshealthDataLoading] = useState(true);

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

  let totalCaloriesSum = 0;

  function formatDate(date) {
    let current = new Date(date);
    let year = current.getFullYear();
    let month = current.getMonth() + 1;
    let day = current.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  }

  const updateCalories = async () => {
    const date = currentDate.format("YYYY-MM-DD");

    const response = await getLoggedFood({
      user_id: currentUser?.user_id,
      date: date,
    });

    if (response.success) {
      setMealTotals(response.data.mealTotals);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateCalories();
    }, [])
  );

  const [openWeightModal, setOpenWeightModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [weight, setWeight] = useState("");

  const [logDate, setLogDate] = useState(new Date());

  const [openDatePicker, setOpenDatePicker] = useState(false);

  // Calculate the sum of total_calories using forEach
  mealTotals?.forEach((item) => {
    const numericCalories = parseFloat(item?.total_calories);
    totalCaloriesSum += isNaN(numericCalories) ? 0 : numericCalories;
  });

  const [date, setDate] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");

  const [weightLogs, setWeightLogs] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

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

  useEffect(() => {
    fetchWeightLogs();
  }, [currentUser, openWeightModal]);

  const onLogSteps = async () => {
    if (currentUser && !ishealthDataLoading) {
      const response = await logSteps({
        user_id: currentUser?.user_id,
        steps: steps,
      });
      console.log("🚀 ~ response:", response);
    }
  };

  useFocusEffect(() => {
    onLogSteps();
  });

  useEffect(() => {
    const fetchHealthData = async () => {
      setIshealthDataLoading(true);
      const values = await getAndroidData();

      if (!values.success) {
        setIsHealthDataGranted(false);
      } else {
        setCalories(values.totalCalories);
        setSteps(values.totalSteps);
        setIsHealthDataGranted(true);
      }
      setIshealthDataLoading(false);
    };

    fetchHealthData();
  }, []);

  const onDateChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;

      if (Platform.OS === "android") {
        setOpenDatePicker(false);
        setLogDate(currentDate);
      }
    } else {
      setOpenDatePicker(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  const [isWeightInvalid, setIsWeightInvalid] = useState(false);
  const [invalidWeightMessage, setInvalidWeightMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

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
      setDate(dayjs());
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

  return (
    <>
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <SafeAreaView style={{ paddingHorizontal: 5 }}>
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
                  value={formatDate(logDate)}
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
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
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
                    {date.format("hh:mm A")}
                  </HeaderText>
                  <BodyText style={{ color: colors.gray }}>
                    {date.format("dddd, MMMM D")}
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
                          value={totalCaloriesSum}
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
                      {totalCaloriesSum} kcals completed
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
                      <View
                        style={{
                          backgroundColor: colors.secondary.normal,
                          flex: 1,
                          borderRadius: 10,
                          padding: 15,
                          width: "100%",
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
                          <HeaderText style={{ color: colors.white }}>
                            Connect to track {"\n"} steps
                          </HeaderText>
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: colors.warning.normal,
                          flex: 1,
                          borderRadius: 10,
                          padding: 15,
                          width: "100%",
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
                          <HeaderText style={{ color: colors.white }}>
                            Connect to track calories
                          </HeaderText>
                        </View>
                      </View>
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
