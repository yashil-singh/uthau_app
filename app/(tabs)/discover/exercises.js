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
import React, { useCallback, useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { Searchbar } from "react-native-paper";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import CardOption from "../../../components/CardOption";
import { Feather } from "@expo/vector-icons";
import formatWord from "../../../helpers/formatWord";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useFocusEffect } from "expo-router";

const exercises = () => {
  const { user } = useAuthContext();

  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;

  // Search related states
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

  const [isLoading, setIsLoading] = useState(false);

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const toggleModal = () => {
    setOpenModal(!openModal);
    setSaveError(null);
  };
  const [saveError, setSaveError] = useState(null);

  // Saved exercises
  const [savedExercises, setSavedExercises] = useState([]);

  const [displayedExercises, setDisplayedExercises] = useState(
    searchResults?.slice(0, 10)
  );

  // Load more exercises as the user scrolls
  const handleEndReached = () => {
    if (displayedExercises == null || displayedExercises == []) return null;
    const remainingExercises = searchResults?.slice(
      displayedExercises?.length,
      displayedExercises?.length + 10
    );

    setDisplayedExercises((prev) => [...prev, ...remainingExercises]);
  };

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
      setSearchResults(data);
    } else {
      setSearchError(response.error);
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

  // To save an exercise
  const onSave = async ({
    exercise_id,
    exercise_name,
    target,
    secondaryMuscles,
    instructions,
    equipment,
    gifUrl,
    bodyPart,
    user_id,
  }) => {
    setSaveError(null);
    try {
      const response = await saveExercise({
        exercise_id,
        exercise_name,
        target,
        secondaryMuscles,
        instructions,
        equipment,
        gifUrl,
        bodyPart,
        user_id,
      });

      if (!response.success) {
        setSaveError(response.message);
      }
    } catch (error) {
      setSaveError("Unexpected error occured. Try again later.");
    }
  };

  // To remove from saved
  const onRemove = async ({ user_id, exercise_id }) => {
    try {
      await removeSavedExercise({ user_id, exercise_id });
      setSaveError("Exercise revmounted successfully.");
    } catch (error) {
      console.log("🚀 ~ error:", error);
      setSaveError("Unexpected error occured. Try again later.");
    }
  };

  const fetchSavedExercises = async () => {
    try {
      const response = await getSavedExercises(currentUser.user_id);

      const data = response?.data;

      setSavedExercises(data);
    } catch (error) {
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedExercises();
    }, [searchResults, modalData, saveError])
  );

  // Check if the exercise is saved or not
  const checkSaved = (exercise_id) => {
    const check = savedExercises.find(
      (exercise) => exercise.exercise_id == exercise_id
    );
    if (check) {
      return true;
    }

    return false;
  };

  // Store the results
  const [searchResults, setSearchResults] = useState([
    {
      bodyPart: "back",
      equipment: "body weight",
      gifUrl: "https://v2.exercisedb.io/image/yeTvGyEDjdVemF",
      id: "3293",
      instructions: [
        "Start by hanging from a pull-up bar with an overhand grip, slightly wider than shoulder-width apart.",
        "Engage your core and pull your shoulder blades down and back.",
        "As you pull yourself up, bend one arm and bring your elbow towards your side, while keeping the other arm straight.",
        "Continue pulling until your chin is above the bar and your bent arm is fully flexed.",
        "Lower yourself back down with control, straightening the bent arm and repeating the movement on the other side.",
        "Alternate sides with each repetition.",
      ],
      name: "archer pull up",
      secondaryMuscles: ["biceps", "forearms"],
      target: "lats",
    },
    {
      bodyPart: "back",
      equipment: "leverage machine",
      gifUrl: "https://v2.exercisedb.io/image/-4en8gCYbCHOFu",
      id: "0015",
      instructions: [
        "Adjust the machine to your desired weight and height.",
        "Place your hands on the parallel bars with a close grip, palms facing each other.",
        "Hang from the bars with your arms fully extended and your feet off the ground.",
        "Engage your back muscles and pull your body up towards the bars, keeping your elbows close to your body.",
        "Continue pulling until your chin is above the bars.",
        "Pause for a moment at the top, then slowly lower your body back down to the starting position.",
        "Repeat for the desired number of repetitions.",
      ],
      name: "assisted parallel close grip pull-up",
      secondaryMuscles: ["biceps", "forearms"],
      target: "lats",
    },
  ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <Modal transparent animationType="fade" visible={openModal}>
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
              onPress={toggleModal}
            />
            <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
          </View>
          <FlatList
            data={[modalData]}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            onEndReachedThreshold={0.3}
            onEndReached={handleEndReached}
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
                            onRemove({
                              user_id: currentUser?.user_id,
                              exercise_id: item.id,
                            })
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
                            onSave({
                              exercise_id: modalData.id,
                              exercise_name: modalData.name,
                              target: modalData.target,
                              secondaryMuscles: modalData.secondaryMuscles,
                              instructions: modalData.instructions,
                              equipment: modalData.equipment,
                              gifUrl: modalData.gifUrl,
                              bodyPart: modalData.bodyPart,
                              user_id: currentUser?.user_id,
                            })
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
        <Animated.View entering={FadeInDown.springify()}>
          <SubHeaderText style={{ fontSize: 12 }}>
            What are you looking for?
          </SubHeaderText>
          <Searchbar
            placeholder="Search exercises"
            style={{
              borderRadius: 6,
              backgroundColor: "#f2f2f2",
            }}
            iconColor={colors.primary.normal}
            inputStyle={{ fontSize: 14 }}
            showDivider={true}
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
            onEndEditing={onSearch}
            onIconPress={onSearch}
            loading={searchIsLoading}
            editable={!searchIsDisabled}
          />
          {searchError && (
            <BodyText style={styles.errorMessage}>{searchError}</BodyText>
          )}
        </Animated.View>
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
                  <Pressable onPress={() => setSearchResults([])}>
                    <BodyText style={{ color: colors.primary.normal }}>
                      Clear
                    </BodyText>
                  </Pressable>
                </View>
                <FlatList
                  data={searchResults}
                  renderItem={({ item, index }) => (
                    <CardOption
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
                        onSave({
                          exercise_id: item.id,
                          exercise_name: item.name,
                          target: item.target,
                          secondaryMuscles: item.secondaryMuscles,
                          instructions: item.instructions,
                          equipment: item.equipment,
                          gifUrl: item.gifUrl,
                          bodyPart: item.bodyPart,
                          user_id: currentUser?.user_id,
                        })
                      }
                      handleRemove={() =>
                        onRemove({
                          user_id: currentUser?.user_id,
                          exercise_id: item.id,
                        })
                      }
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                />
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
