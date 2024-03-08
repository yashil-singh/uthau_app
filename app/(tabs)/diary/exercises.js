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
import React, { useCallback, useEffect, useState } from "react";
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

const exercises = () => {
  const { user } = useAuthContext();
  // Decode and get the data of the current user
  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;

  // Import hooks related to exercises
  const { getSavedExercises, removeSavedExercise } = useExercise();

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  // To store the current saved exercises
  const [savedExercises, setSavedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // States related to messages to display
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [message, setMessage] = useState(null);

  // To remove from save
  const onRemove = async ({ user_id, exercise_id }) => {
    setResponseMessage(null);
    setErrorMessage(null);
    setMessage(null);
    try {
      const response = await removeSavedExercise({ user_id, exercise_id });
      if (response.success) {
        setOpenModal(false);
        setMessage("Exercise removed");
      } else {
        setMessage("Failed to remove exercise");
        setOpenErrorModal(true);
        setErrorMessage(response.message);
      }
    } catch (error) {
      setMessage("Failed to remove exercise");
      setErrorMessage(
        "Unexpected error occurred while removing the exercise. Try again later."
      );
    }
  };

  // To get the saved exercises of the user
  const getSaved = async () => {
    try {
      const response = await getSavedExercises(currentUser?.user_id);

      if (response.success) {
        const data = response?.data;

        if (response.status == 202) {
          setResponseMessage(response.message);
        }

        if (data) {
          setSavedExercises(data);
        }

        setMessage("Fetched saved exercises");
      } else {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
        setMessage("Failed to fetch saved exercises.");
      }
    } catch (error) {
      setOpenErrorModal(true);
      setErrorMessage("Unexpected error occurred. Try again later.");
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSaved();
    }, [message, openModal])
  );

  return (
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
                    <Pressable
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "flex-end",
                      }}
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
                    </Pressable>
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

                <HeaderText style={{ fontSize: 18 }}>Instructions</HeaderText>
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
          {savedExercises?.length <= 0 ? (
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
              data={savedExercises}
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
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </MainContainer>
  );
};

export default exercises;
