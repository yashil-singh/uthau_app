import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  Pressable,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import useExercise from "../../../hooks/useExercise";
import { colors } from "../../../helpers/theme";
import CardOption from "../../../components/CardOption";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import formatWord from "../../../helpers/formatWord";
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import ErrorModal from "../../../components/ErrorModal";
import useDecode from "../../../hooks/useDecode";
import Toast from "../../../components/Toast";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";

const exercises = () => {
  const { user } = useAuthContext();

  // Decode and get the data of the current user
  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

  // Import hooks related to exercises
  const { getSavedExercises, removeSavedExercise } = useExercise([]);

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  // Pagination related states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Initialize with 1 page
  const resultsPerPage = 10;
  const flatListRef = useRef(null);

  // To get the saved exercises of the user
  const getSaved = async () => {
    if (currentUser) {
      setIsLoading(true);
      const response = await getSavedExercises(currentUser?.user_id);

      if (response.success) {
        const data = response?.data;

        if (data) {
          setSavedExercises(data);
        }
      } else {
        setOpenToast(true);
        setToastMessage(response.message);
        setToastType("error");
        closeToast();
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSaved();
  }, [currentUser, message]);

  useEffect(() => {
    const totalPagesCount = Math.ceil(savedExercises.length / resultsPerPage);
    setTotalPages(totalPagesCount || 1);
  }, [getSaved]);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };

  // Generate an array of page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

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

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  // To store the current saved exercises
  const [savedExercises, setSavedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // States related to messages to display
  const [errorMessage, setErrorMessage] = useState(null);
  const [message, setMessage] = useState(null);

  // To remove from save
  const onRemove = async ({ user_id, exercise_id }) => {
    const response = await removeSavedExercise({ user_id, exercise_id });
    setOpenToast(true);
    if (response.success) {
      // setToastMessage(response.message);
      // setToastType("success");
      setOpenModal(false);
      setToastMessage(response.message);
      getSaved();
    } else {
      setToastMessage(response.message);
      setToastType("error");
    }
  };

  // To close the toast
  const closeToast = () => [
    setTimeout(() => {
      setOpenToast(false);
      setToastMessage("");
      setToastType("");
    }, 3000),
  ];

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
          <ErrorModal
            openErrorModal={openErrorModal}
            title={"Error"}
            message={errorMessage}
            onClose={() => {
              setErrorMessage(null);
              setOpenErrorModal(false);
            }}
            onDismiss={() => {
              setErrorMessage(null);
              setOpenErrorModal(false);
            }}
          />
          <Modal
            transparent
            animationType="slide"
            visible={openModal}
            onRequestClose={() => toggleModal()}
            onDismiss={() => toggleModal()}
          >
            <View
              style={{
                flex: 1,
                paddingHorizontal: 15,
                paddingTop: 5,
                paddingBottom: 15,
                backgroundColor: colors.white,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 30,
                  paddingTop: Platform.OS === "ios" ? 30 : 0,
                }}
              >
                <TouchableRipple
                  onPress={() => toggleModal()}
                  borderless
                  style={{ padding: 5, borderRadius: 100 }}
                >
                  <Feather name="arrow-left" size={24} color="black" />
                </TouchableRipple>
                <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
              </View>
              <FlatList
                data={[modalData]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={{ gap: 25, paddingTop: 20 }}>
                    <Image
                      source={{ uri: `${item?.gif_url}` }}
                      style={{
                        width: "100%",
                        height: 350,
                        resizeMode: "contain",
                      }}
                    />

                    <View style={{ gap: 5 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <HeaderText style={{ fontSize: 24, flex: 2 }}>
                          {formatWord(item?.exercise_name)}
                        </HeaderText>
                        <TouchableRipple
                          style={{
                            borderRadius: 60,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            maxHeight: 35,
                            paddingHorizontal: 8,
                          }}
                          borderless
                          onPress={() => {
                            onRemove({
                              user_id: currentUser?.user_id,
                              exercise_id: item?.exercise_id,
                            });
                          }}
                        >
                          <FontAwesome
                            name="bookmark"
                            size={24}
                            color={colors.warning.normal}
                          />
                        </TouchableRipple>
                      </View>
                      <SubHeaderText style={{ fontSize: 14 }}>
                        Exercise Type: {item?.body_part}
                      </SubHeaderText>

                      <BodyText>
                        <SubHeaderText style={{ fontSize: 12 }}>
                          Targeted muscle(s):
                        </SubHeaderText>{" "}
                        {item?.target}
                      </BodyText>
                      <BodyText>
                        <SubHeaderText style={{ fontSize: 12 }}>
                          Secondary muscle(s):
                        </SubHeaderText>{" "}
                        {item?.secondary_muscles.map((item) => {
                          return `${item}, `;
                        })}
                      </BodyText>
                    </View>

                    <HeaderText style={{ fontSize: 18 }}>
                      Instructions
                    </HeaderText>
                    {item?.instructions.map((item, index) => (
                      <BodyText key={index}>
                        {index + 1}. {item}
                      </BodyText>
                    ))}
                  </View>
                )}
              />
            </View>
          </Modal>
          {isLoading ? (
            <ActivityIndicator
              size={"large"}
              color={colors.primary.normal}
              style={{ flex: 1, justifyContent: "center" }}
            />
          ) : (
            <>
              {currentUser && savedExercises?.length <= 0 ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <HeaderText style={{ textAlign: "center", fontSize: 20 }}>
                    It's a bit empty here!
                  </HeaderText>
                  <BodyText
                    style={{
                      fontSize: 16,
                      display: "flex",
                      textAlign: "center",
                      color: colors.gray,
                    }}
                  >
                    No exercises found in your diary.
                  </BodyText>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={savedExercises.slice(
                    (currentPage - 1) * resultsPerPage,
                    currentPage * resultsPerPage
                  )}
                  renderItem={({ item, index }) => (
                    <CardOption
                      desc={"Targeted muscle(s):"}
                      isSaved={true}
                      title={item.exercise_name}
                      target={item.target}
                      gifUrl={item.gif_url}
                      key={index}
                      style={{ marginBottom: 10 }}
                      onPress={() => {
                        setOpenModal(true);
                        setModalData(item);
                      }}
                      handleRemove={() =>
                        onRemove({
                          user_id: currentUser?.user_id,
                          exercise_id: item.exercise_id,
                        })
                      }
                    />
                  )}
                  ListFooterComponent={() => (
                    <View
                      style={{
                        marginTop: 15,
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 20,
                      }}
                    >
                      {getPageNumbers().map((pageNumber) => (
                        <TouchableRipple
                          borderless
                          style={{ padding: 5, borderRadius: 8 }}
                          key={pageNumber}
                          onPress={() => handlePageChange(pageNumber)}
                          disabled={pageNumber === currentPage}
                        >
                          <BodyText
                            style={{
                              color:
                                pageNumber === currentPage
                                  ? colors.gray
                                  : colors.primary.normal,
                            }}
                          >
                            {pageNumber}
                          </BodyText>
                        </TouchableRipple>
                      ))}
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}

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
        </MainContainer>
      )}
    </>
  );
};

export default exercises;
