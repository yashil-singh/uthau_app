import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import useRecipes from "../../../hooks/useRecipes";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import { useFocusEffect } from "expo-router";
import { colors } from "../../../helpers/theme";
import CardOption from "../../../components/CardOption";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import ErrorModal from "../../../components/ErrorModal";
import useDecode from "../../../hooks/useDecode";
import Toast from "../../../components/Toast";

const recipes = () => {
  // Get user token
  const { user } = useAuthContext();

  // Decode token hook
  const { getDecodedToken } = useDecode();

  // Hooks related to recipes
  const { getSavedRecipes, removeSavedRecipe } = useRecipes();

  // To store the current user's data
  const [currentUser, setCurrentUser] = useState(null);

  // Screen related state
  const [isPageLoading, setIsPageLoading] = useState(true);

  // To store the current saved recipes
  const [savedRecipes, setSavedRecipes] = useState([]);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  // States related to messages to display
  const [message, setMessage] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Decode and get the data of the current user
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
        setIsPageLoading(false);
      }

      if (currentUser) {
        setIsPageLoading(false);
      }
    };

    fetchDecodedToken();
  }, [user]);

  // Pagination related states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Initialize with 1 page
  const resultsPerPage = 10;
  const flatListRef = useRef(null);

  useEffect(() => {
    getSaved();
  }, [currentUser, message]);

  // To get the saved recipes of the user
  const getSaved = async () => {
    if (currentUser) {
      setIsLoading(true);
      const response = await getSavedRecipes(currentUser?.user_id);

      if (response.success) {
        const data = response?.data;

        if (response.status == 202) {
          setResponseMessage(response.message);
        }

        if (data) {
          setSavedRecipes(data);
        }
      } else {
        setOpenToast(true);
        setToastMessage(response.message);
        setToastType("error");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const totalPagesCount = Math.ceil(savedRecipes.length / resultsPerPage);

    setTotalPages(totalPagesCount || 1);
  }, [currentUser, getSaved]);

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

  // To remove from save
  const onRemove = async ({ user_id, recipe_id }) => {
    const response = await removeSavedRecipe({ user_id, recipe_id });

    if (response.success) {
      setToastMessage(response.message);
      getSaved();
    } else {
      setToastMessage(response.message);
    }
    setOpenToast(true);
  };

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
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
            onClose={() => {
              setOpenErrorModal(false);
            }}
            onDismiss={() => {
              setOpenErrorModal(false);
            }}
            title={"Error"}
            message={errorMessage}
          />
          <Modal
            transparent
            animationType="fade"
            visible={openModal}
            onRequestClose={() => {
              setOpenModal(false);
              setModalData(null);
            }}
            onDismiss={() => {
              setOpenModal(false);
              setModalData(null);
            }}
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
                }}
              >
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={toggleModal}
                >
                  <Feather name="arrow-left" size={24} color="black" />
                </TouchableRipple>
                <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
              </View>
              <FlatList
                data={[modalData]}
                showsVerticalScrollIndicator={false}
                keyExtractor={(index) => index}
                renderItem={(item, index) => (
                  <View key={index}>
                    <Image
                      style={{
                        width: "100%",
                        height: 350,
                        resizeMode: "contain",
                        marginBottom: 15,
                      }}
                      source={{ uri: `${modalData?.img_url}` }}
                    />
                    <View style={{ gap: 20, paddingBottom: 10 }}>
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <HeaderText style={{ fontSize: 24, flex: 2 }}>
                            {modalData?.recipe_name}
                          </HeaderText>
                          <View>
                            <TouchableRipple
                              style={{
                                borderRadius: 100,
                                paddingVertical: 5,
                                paddingHorizontal: 8,
                              }}
                              borderless
                              onPress={() => {
                                onRemove({
                                  user_id: currentUser?.user_id,
                                  recipe_id: modalData?.recipe_id,
                                });
                                setOpenModal(false);
                              }}
                            >
                              <FontAwesome
                                name="bookmark"
                                size={24}
                                color={colors.warning.normal}
                              />
                            </TouchableRipple>
                          </View>
                        </View>
                        <SubHeaderText style={{ color: colors.gray }}>
                          Cooking time: {modalData?.cook_time} mins
                        </SubHeaderText>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <SubHeaderText>Tags: </SubHeaderText>
                        <FlatList
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ paddingHorizontal: 5 }}
                          data={modalData.tags}
                          keyExtractor={(index) => index}
                          renderItem={({ item, index }) => (
                            <View style={styles.tag} key={index}>
                              <BodyText style={{ color: colors.white }}>
                                {item}
                              </BodyText>
                            </View>
                          )}
                        />
                      </View>

                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: "#e3e3e3",
                          paddingHorizontal: 15,
                          paddingVertical: 25,
                          borderRadius: 6,
                          gap: 10,
                        }}
                      >
                        <HeaderText style={{ fontSize: 20 }}>Macros</HeaderText>
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                            gap: 30,
                          }}
                        >
                          <View style={styles.nutrientsContainer}>
                            <HeaderText
                              style={{
                                fontSize: 21,
                                color: colors.warning.normal,
                              }}
                            >
                              {Math.floor(modalData?.calories).toLocaleString()}
                            </HeaderText>
                            <BodyText style={{ color: colors.warning.normal }}>
                              Cal
                            </BodyText>
                          </View>
                          <View style={styles.nutrientsContainer}>
                            <HeaderText
                              style={{ fontSize: 21, color: "#00bfbf" }}
                            >
                              {Math.floor(modalData?.carbs).toLocaleString()}g
                            </HeaderText>
                            <BodyText style={{ color: "#00bfbf" }}>
                              Carbs
                            </BodyText>
                          </View>
                          <View style={styles.nutrientsContainer}>
                            <HeaderText
                              style={{ fontSize: 21, color: "#6a607b" }}
                            >
                              {Math.floor(modalData?.fat).toLocaleString()}g
                            </HeaderText>
                            <BodyText style={{ color: "#6a607b" }}>
                              Fat
                            </BodyText>
                          </View>
                          <View style={styles.nutrientsContainer}>
                            <HeaderText
                              style={{ fontSize: 21, color: "#cd7f32" }}
                            >
                              {Math.floor(modalData?.protein).toLocaleString()}g
                            </HeaderText>
                            <BodyText style={{ color: "#cd7f32" }}>
                              Protein
                            </BodyText>
                          </View>
                        </View>
                      </View>

                      <View style={{ gap: 8 }}>
                        <HeaderText style={{ fontSize: 20 }}>
                          Ingredients
                        </HeaderText>
                        {modalData?.ingredients.map((item, index) => (
                          <BodyText key={index}>{item}</BodyText>
                        ))}
                      </View>

                      <View style={{ gap: 5 }}>
                        <BodyText>
                          For cooking instructions, do visit:{" "}
                        </BodyText>
                        <LinkText href={modalData?.instruction_link}>
                          {modalData?.instruction_link}
                        </LinkText>
                      </View>
                    </View>
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
              {currentUser && savedRecipes?.length <= 0 ? (
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
                    No recipes found in your diary.
                  </BodyText>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={savedRecipes.slice(
                    (currentPage - 1) * resultsPerPage,
                    currentPage * resultsPerPage
                  )}
                  renderItem={({ item, index }) => (
                    <CardOption
                      desc={`${Math.floor(item.calories)
                        .toFixed(0)
                        .toLocaleString()} cals \n`}
                      isSaved={true}
                      title={item.recipe_name}
                      target={`Cooking Time: ${Math.floor(
                        item.cook_time
                      )} mins`}
                      gifUrl={item.img_url}
                      key={index}
                      style={{ marginBottom: 10 }}
                      onPress={() => {
                        setOpenModal(true);
                        setModalData(item);
                      }}
                      handleRemove={() =>
                        onRemove({
                          user_id: currentUser?.user_id,
                          recipe_id: item.recipe_id,
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

const styles = StyleSheet.create({
  dietHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    height: 30,
    width: "50%",
  },
  placeholderStyle: {
    fontSize: 14,
    color: colors.primary.normal,
    textAlign: "right",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: colors.info.dark,
    textAlign: "right",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
    paddingBottom: 15,
  },
  nutrientsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  tag: {
    backgroundColor: colors.primary.normal,
    padding: 8,
    borderRadius: 16,
    marginRight: 5,
  },
});

export default recipes;
