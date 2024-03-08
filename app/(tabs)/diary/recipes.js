import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import React, { useCallback, useState } from "react";
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
import { TouchableRipple } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import ErrorModal from "../../../components/ErrorModal";

const recipes = () => {
  const { user } = useAuthContext();
  // Decode and get the data of the current user
  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;

  // Import hooks related to recipes
  const { getSavedRecipes, removeSavedRecipe } = useRecipes();

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
  };

  // To store the current saved recipes
  const [savedRecipes, setSavedRecipes] = useState([]);

  // States related to messages to display
  const [message, setMessage] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // To remove from save
  const onRemove = async ({ user_id, recipe_id }) => {
    setMessage(null);
    try {
      const response = await removeSavedRecipe({ user_id, recipe_id });

      if (response.success) {
        setMessage("Exercise removed form diary.");
      } else {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage(
        "Unexpected error occurred while removing the exercise. Try again later."
      );
      setMessage("Error removing the recipe.");
    }
  };

  // To get the saved recipes of the user
  const getSaved = async () => {
    try {
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
        setOpenErrorModal(true);
        setErrorMessage(response.message);
      }
    } catch (error) {
      console.log("🚀 ~ error:", error);
      setMessage("Unexpected error occurred. Try again later.");
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSaved();
    }, [message])
  );

  return (
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

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                          style={{ fontSize: 21, color: colors.warning.normal }}
                        >
                          {Math.floor(modalData?.calories).toLocaleString()}
                        </HeaderText>
                        <BodyText style={{ color: colors.warning.normal }}>
                          Cal
                        </BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#00bfbf" }}>
                          {Math.floor(modalData?.carbs).toLocaleString()}g
                        </HeaderText>
                        <BodyText style={{ color: "#00bfbf" }}>Carbs</BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#6a607b" }}>
                          {Math.floor(modalData?.fat).toLocaleString()}g
                        </HeaderText>
                        <BodyText style={{ color: "#6a607b" }}>Fat</BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#cd7f32" }}>
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
                    <BodyText>For cooking instructions, do visit: </BodyText>
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
          {savedRecipes?.length <= 0 ? (
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
              data={savedRecipes}
              renderItem={({ item, index }) => (
                <CardOption
                  desc={`${Math.floor(item.calories)
                    .toFixed(0)
                    .toLocaleString()} cals \n`}
                  isSaved={true}
                  title={item.recipe_name}
                  target={`Cooking Time: ${Math.floor(item.cook_time)} mins`}
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
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </MainContainer>
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
