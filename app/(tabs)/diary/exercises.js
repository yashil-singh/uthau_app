import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  Pressable,
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

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  // To store the current saved exercises
  const [savedExercises, setSavedExercises] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // States related to messages to display
  const [message, setMessage] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);

  // To remove from save
  const onRemove = async ({ user_id, exercise_id }) => {
    setSaveMessage(null);
    try {
      await removeSavedExercise({ user_id, exercise_id });
      setSaveMessage("REMOVED");
    } catch (error) {
      console.log("🚀 ~ error:", error);
      setMessage("Error removing the exercise.");
    }
  };

  // To get the saved exercises of the user
  const getSaved = async () => {
    setMessage(null);
    setResponseMessage(null);
    setIsLoading(true);
    try {
      const response = await getSavedExercises(currentUser?.user_id);

      if (response.success) {
        const data = response?.data;

        if (data.length <= 0) {
          setResponseMessage("No saved exercises were found.");
        }
        setSavedExercises(data);
      } else {
        setMessage(response.message);
      }

      setIsLoading(false);
    } catch (error) {
      console.log("🚀 ~ error:", error);
      setMessage("Unexpected error occurred. Try again later.");
      setIsLoading(false);
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSaved();
    }, [openModal, saveMessage])
  );

  return (
    <MainContainer padding={15}>
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
                        setOpenModal(false);
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
          {message || responseMessage ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <BodyText
                style={{
                  fontSize: 16,
                  display: "flex",
                  textAlign: "center",
                  color: message ? colors.error.normal : colors.black,
                }}
              >
                {message || responseMessage}
              </BodyText>
            </View>
          ) : (
            <FlatList
              data={savedExercises}
              renderItem={({ item, index }) => (
                <CardOption
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
