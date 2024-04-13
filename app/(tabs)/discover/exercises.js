import {
  View,
  KeyboardAvoidingView,
  Image,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { Portal, Searchbar, Snackbar } from "react-native-paper";
import { colors } from "../../../helpers/theme";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import OptionsContainer from "../../../components/OptionsContainer";
import arms from "../../../assets/images/arms.png";
import back from "../../../assets/images/back.png";
import cardio from "../../../assets/images/cardio.png";
import chest from "../../../assets/images/chest.png";
import leg from "../../../assets/images/leg.png";
import useExercise from "../../../hooks/useExercise";
import CardOption from "../../../components/CardOption";
import { Feather } from "@expo/vector-icons";
import formatWord from "../../../helpers/formatWord";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useFocusEffect } from "expo-router";
import ErrorModal from "../../../components/ErrorModal";
import useDecode from "../../../hooks/useDecode";

const exercises = () => {
  const { user } = useAuthContext();

  const { getDecodedToken } = useDecode();

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

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

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  // Pagination related states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Initialize with 1 page
  const resultsPerPage = 10;
  const flatListRef = useRef(null);

  useEffect(() => {
    // Update total pages whenever search results change
    const totalPagesCount = Math.ceil(searchResults.length / resultsPerPage);
    setTotalPages(totalPagesCount || 1); // Ensure there's always at least 1 page

    setCurrentPage(1);
  }, [searchResults, onSearch, onGetBodyPart]);

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

  // Exercises related hooks
  const {
    searchExercise,
    getBodyPart,
    saveExercise,
    getSavedExercises,
    removeSavedExercise,
  } = useExercise();
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [searchIsDisabled, setSearchIsDisabled] = useState(false);

  // Store the results

  const [isLoading, setIsLoading] = useState(false);

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const toggleModal = () => {
    setOpenModal(!openModal);
    setModalData(null);
  };

  const [saveError, setSaveError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);

  // Saved exercises
  const [savedExercises, setSavedExercises] = useState([]);

  // When searching for exercise
  const onSearch = async () => {
    if (searchQuery == null || searchQuery == "") {
      return;
    }

    setSearchIsLoading(true);
    setSearchIsDisabled(true);

    const response = await searchExercise({ searchQuery });

    if (response.success) {
      const data = response?.data;
      if (data.length == 0) {
        setResultMessage("No results found.");
      }

      setSearchResults(data);
    } else {
      setOpenErrorModal(true);
      setSaveError(response.error);
      setSearchResults([]);
    }

    setSearchIsLoading(false);
    setSearchIsDisabled(false);
  };

  // When searching for exercise of given body part
  const onGetBodyPart = async (bodyPart) => {
    setSearchIsDisabled(true);
    setIsLoading(true);

    const response = await getBodyPart({ bodyPart });

    if (response.success) {
      const data = response?.data;

      setSearchResults(data);
    } else {
      setSearchError(response.error);
      setSearchResults([]);
    }

    setSearchIsDisabled(false);
    setIsLoading(false);
  };

  const handleBookmark = async (exerciseData, operation) => {
    const {
      exercise_id,
      exercise_name,
      target,
      secondaryMuscles,
      instructions,
      equipment,
      gifUrl,
      bodyPart,
    } = exerciseData;
    const user_id = currentUser?.user_id;

    const response =
      operation === "save"
        ? await saveExercise({
            exercise_id,
            exercise_name,
            target,
            secondaryMuscles,
            instructions,
            equipment,
            gifUrl,
            bodyPart,
            user_id,
          })
        : await removeSavedExercise({ user_id, exercise_id });

    setOpenToast(true);
    setToastMessage(response.message);
    fetchSavedExercises();
  };

  const fetchSavedExercises = async () => {
    if (currentUser) {
      const response = await getSavedExercises(currentUser?.user_id);

      const data = response?.data;

      setSavedExercises(data);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedExercises();
    }, [searchResults])
  );

  // Check if the exercise is saved or not
  const checkSaved = (exercise_id) => {
    const check = savedExercises?.find(
      (exercise) => exercise.exercise_id == exercise_id
    );
    if (check) {
      return true;
    }

    return false;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={"Error"}
        message={saveError}
        onClose={() => {
          setOpenErrorModal(false);
          setSaveError(null);
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
        transparent
        animationType="slide"
        visible={openModal}
        onRequestClose={() => toggleModal()}
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
            <Feather
              name="arrow-left"
              size={24}
              color="black"
              onPress={() => toggleModal()}
            />
            <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
          </View>
          <FlatList
            data={[modalData]}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ gap: 25, paddingTop: 20 }}>
                {item?.gifUrl && (
                  <Image
                    source={{ uri: `${item.gifUrl}` }}
                    style={{
                      width: "100%",
                      height: 350,
                      resizeMode: "contain",
                    }}
                  />
                )}

                <View style={{ gap: 5 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <HeaderText style={{ fontSize: 24, flex: 2 }}>
                      {formatWord(item?.name)}
                    </HeaderText>
                    <View>
                      {checkSaved(item.id) ? (
                        <TouchableRipple
                          style={{
                            borderRadius: 100,
                            paddingVertical: 5,
                            paddingHorizontal: 8,
                          }}
                          borderless
                          onPress={() =>
                            handleBookmark(
                              {
                                exercise_id: item.id,
                              },
                              "remove"
                            )
                          }
                        >
                          <FontAwesome
                            name="bookmark"
                            size={24}
                            color={colors.warning.normal}
                          />
                        </TouchableRipple>
                      ) : (
                        <TouchableRipple
                          style={{
                            borderRadius: 100,
                            paddingVertical: 5,
                            paddingHorizontal: 8,
                          }}
                          borderless
                          onPress={() =>
                            handleBookmark(
                              {
                                exercise_id: item.id,
                                exercise_name: item.name,
                                target: item.target,
                                secondaryMuscles: item.secondaryMuscles,
                                instructions: item.instructions,
                                equipment: item.equipment,
                                gifUrl: item.gifUrl,
                                bodyPart: item.bodyPart,
                              },
                              "save"
                            )
                          }
                        >
                          <FontAwesome
                            name="bookmark-o"
                            size={24}
                            color={colors.warning.normal}
                          />
                        </TouchableRipple>
                      )}
                    </View>
                  </View>
                  <SubHeaderText style={{ fontSize: 14 }}>
                    Exercise Type: {item?.bodyPart}
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
                    {item?.secondaryMuscles.map((item) => {
                      return `${item}, `;
                    })}
                  </BodyText>
                </View>

                <HeaderText style={{ fontSize: 18 }}>Instructions</HeaderText>
                {item?.instructions.map((item, index) => (
                  <BodyText key={index}>
                    {index + 1}. {item}
                  </BodyText>
                ))}

                <BodyText
                  style={{ color: colors.error.normal, textAlign: "center" }}
                >
                  {saveError}
                </BodyText>
              </View>
            )}
          />
        </View>
      </Modal>
      <MainContainer padding={15} gap={15}>
        <View>
          <SubHeaderText style={{ fontSize: 12 }}>
            What are you looking for?
          </SubHeaderText>
          <Searchbar
            placeholder="Search exercises"
            style={{
              borderRadius: 6,
              backgroundColor: colors.white,
              display: "flex",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.lightGray,
            }}
            inputStyle={{ fontSize: 14, color: colors.black }}
            placeholderTextColor={colors.gray}
            iconColor={colors.primary.normal}
            showDivider={true}
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
            onEndEditing={onSearch}
            onIconPress={onSearch}
            loading={searchIsLoading}
            editable={!searchIsDisabled}
            onClearIconPress={() => {
              setResultMessage(null);
              setCurrentPage(1);
            }}
          />
          {searchError && (
            <BodyText style={styles.errorMessage}>{searchError}</BodyText>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator
            style={{ flex: 1, justifyContent: "center" }}
            color={colors.primary.normal}
            size={"large"}
          />
        ) : (
          <>
            {searchResults?.length > 0 ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setSearchResults([]);
                      setCurrentPage(1);
                    }}
                  >
                    <BodyText style={{ color: colors.primary.normal }}>
                      Clear
                    </BodyText>
                  </Pressable>
                </View>
                <FlatList
                  ref={flatListRef}
                  data={searchResults.slice(
                    (currentPage - 1) * resultsPerPage,
                    currentPage * resultsPerPage
                  )}
                  renderItem={({ item, index }) => (
                    <CardOption
                      desc={"Targeted muscle(s):"}
                      isSaved={checkSaved(item.id)}
                      title={item.name}
                      target={item.target}
                      gifUrl={item.gifUrl}
                      key={index}
                      style={{ marginBottom: 10 }}
                      onPress={() => {
                        setOpenModal(true);
                        setModalData(item);
                      }}
                      handleSave={() =>
                        handleBookmark(
                          {
                            exercise_id: item.id,
                            exercise_name: item.name,
                            target: item.target,
                            secondaryMuscles: item.secondaryMuscles,
                            instructions: item.instructions,
                            equipment: item.equipment,
                            gifUrl: item.gifUrl,
                            bodyPart: item.bodyPart,
                          },
                          "save"
                        )
                      }
                      handleRemove={() =>
                        handleBookmark(
                          {
                            exercise_id: item.id,
                          },
                          "remove"
                        )
                      }
                    />
                  )}
                  showsVerticalScrollIndicator={false}
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
                />
              </>
            ) : (
              <>
                {resultMessage != null ? (
                  <>
                    <View
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <SubHeaderText
                        style={{ fontSize: 18, textAlign: "center" }}
                      >
                        No results found.
                      </SubHeaderText>
                    </View>
                  </>
                ) : (
                  <View style={{ gap: 10 }}>
                    <OptionsContainer
                      title="Arms"
                      color={colors.orange.normal}
                      desc="Find exercises that best target your arm muscles."
                      onPress={() => onGetBodyPart("upper arms")}
                    >
                      <Image
                        source={arms}
                        style={{
                          width: 35,
                          height: 35,
                          resizeMode: "cover",
                        }}
                      />
                    </OptionsContainer>
                    <OptionsContainer
                      title="Chest"
                      color={colors.secondary.normal}
                      desc="Find exercises that best target your chest muscles."
                      onPress={() => onGetBodyPart("chest")}
                    >
                      <Image
                        source={chest}
                        style={{
                          width: 50,
                          height: 35,
                          resizeMode: "cover",
                        }}
                      />
                    </OptionsContainer>
                    <OptionsContainer
                      title="Back"
                      color={colors.warning.normal}
                      desc="Find exercises that best target your back muscles."
                      onPress={() => onGetBodyPart("back")}
                    >
                      <Image
                        source={back}
                        style={{
                          width: 50,
                          height: 35,
                          resizeMode: "cover",
                        }}
                      />
                    </OptionsContainer>
                    <OptionsContainer
                      title="Leg"
                      color={colors.info.normal}
                      desc="Find exercises that best target your leg muscles."
                      onPress={() => onGetBodyPart("upper legs")}
                    >
                      <Image
                        source={leg}
                        style={{
                          width: 45,
                          height: 35,
                          resizeMode: "cover",
                        }}
                      />
                    </OptionsContainer>
                    <OptionsContainer
                      title="Cardio and Abs"
                      color={colors.error.normal}
                      desc="Find exercises that best trains your cardio and abs."
                      onPress={() => onGetBodyPart("cardio")}
                    >
                      <Image
                        source={cardio}
                        style={{
                          width: 35,
                          height: 35,
                          resizeMode: "cover",
                        }}
                      />
                    </OptionsContainer>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </MainContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  errorMessage: {
    textAlign: "center",
    color: colors.warning.normal,
  },
});

export default exercises;
