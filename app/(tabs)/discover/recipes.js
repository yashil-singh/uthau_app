import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { Searchbar } from "react-native-paper";
import useRecipes from "../../../hooks/useRecipes";
import CardOption from "../../../components/CardOption";
import { Feather } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { useFocusEffect } from "expo-router";
import ErrorModal from "../../../components/ErrorModal";
import breakfast from "../../../assets/images/breakfast.png";
import lunch from "../../../assets/images/lunch.png";
import snacks from "../../../assets/images/snacks.png";
import dinner from "../../../assets/images/dinner.png";
import OptionsContainer from "../../../components/OptionsContainer";
import useDecode from "../../../hooks/useDecode";

const recipes = () => {
  const { user } = useAuthContext();

  // Decode and get the data of the current user
  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

  const [isPageLoading, setIsPageLoading] = useState(true);

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

  const [searchResults, setSearchResults] = useState(null);

  // Pagination related states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Initialize with 1 page
  const resultsPerPage = 10;
  const flatListRef = useRef(null);
  console.log("🚀 ~ searchResults:", searchResults?.length);

  useEffect(() => {
    // Update total pages whenever search results change
    if (searchResults) {
      const totalPagesCount = Math.ceil(searchResults.length / resultsPerPage);
      setTotalPages(totalPagesCount || 1); // Ensure there's always at least 1 page
    }

    setCurrentPage(1);
  }, [searchResults, onSearch]);

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

  const [searchQuery, setSearchQuery] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    searchRecipe,
    getRecipeMeal,
    saveRecipe,
    getSavedRecipes,
    removeSavedRecipe,
  } = useRecipes();

  // Modal related states
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [detailsModalData, setDetailsModalData] = useState(null);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  // Error messages related states
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [message, setMessage] = useState(null);

  const toggleDetailsModal = () => {
    setOpenDetailsModal(!openDetailsModal);
    setErrorMessage(null);
  };

  const getTags = (data) => {
    if (!data) return;
    const tags = [
      ...(data?.dietLabels.map((item, index) => ({
        label: item,
        type: "diet",
        key: `diet_${index}`,
      })) || []),
      ...(data?.healthLabels.map((item, index) => ({
        label: item,
        type: "health",
        key: `health_${index}`,
      })) || []),
    ];
    return tags;
  };

  const [savedRecipes, setSavedRecipes] = useState(null);

  const getSelectedMeal = async ({ meal }) => {
    setIsDisabled(true);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getRecipeMeal({ meal });

      if (response.success) {
        const data = response.data;

        setSearchResults(data.hits);
      } else {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
      }
    } catch (error) {
      console.log("🚀 ~ error:", error);
      setOpenErrorModal(true);
      setErrorMessage("Unexpected error occurred. Try again later.");
    }

    setIsDisabled(false);
    setIsLoading(false);
  };

  const fetchSavedRecipes = async () => {
    if (currentUser) {
      const response = await getSavedRecipes(currentUser?.user_id);

      const data = response?.data;

      setSavedRecipes(data);
    }
  };

  const onSearch = async () => {
    setIsLoading(true);
    setIsDisabled(true);
    const response = await searchRecipe({ searchQuery });

    if (response.success) {
      setSearchResults(response.data.hits);
    } else {
      setOpenErrorModal(true);
      setSearchError(response.message);
    }
    setIsLoading(false);
    setIsDisabled(false);
  };

  const onSave = async ({
    recipe_name,
    recipe_id,
    ingredients,
    servings,
    cooking_time,
    tags,
    calories,
    carbs,
    protein,
    fat,
    instruction_link,
    img_url,
  }) => {
    setErrorMessage(null);
    try {
      const response = await saveRecipe({
        user_id: currentUser?.user_id,
        recipe_id,
        recipe_name,
        ingredients,
        servings,
        cooking_time,
        tags,
        calories,
        carbs,
        protein,
        fat,
        instruction_link,
        img_url,
      });

      if (!response.success) {
        setOpenErrorModal(true);
        setErrorMessage(response.message);
        setMessage("Error saving recipe.");
      } else {
        setMessage("Recipe Saved");
      }
    } catch (error) {
      setOpenErrorModal(true);
      setErrorMessage("Unexpected error occured. Try again later.");
      setMessage("Error saving recipe.");
    }

    setMessage(`SAVED RECIPE ${recipe_id}`);
  };

  // To remove from saved
  const onRemove = async ({ user_id, recipe_id }) => {
    try {
      const response = await removeSavedRecipe({ user_id, recipe_id });

      if (response.success) {
        setErrorMessage(response.message);
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      console.log("🚀 ~ recipes.js error:", error);
      setErrorMessage("Unexpected error occured. Try again later.");
    }
    setMessage(`REMOVED RECIPE ${recipe_id}`);
  };

  const convertMetric = (numberToconvert, numOfServings) => {
    if (!numberToconvert || !numOfServings) return null;
    return Math.round(numberToconvert / numOfServings);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [searchResults, message])
  );

  // Check if the recipe is saved or not
  const checkSaved = (recipe_id) => {
    const check = savedRecipes?.find((recipe) => recipe.recipe_id == recipe_id);
    if (check) {
      return true;
    }

    return false;
  };

  return (
    <View style={{ flex: 1 }}>
      <ErrorModal
        openErrorModal={openErrorModal}
        title={"Error"}
        message={errorMessage}
        onClose={() => setOpenErrorModal(false)}
        onDismiss={() => setOpenErrorModal(false)}
      />
      <Modal
        transparent
        animationType="slide"
        visible={openDetailsModal}
        onRequestClose={() => {
          setDetailsModalData(null);
          setErrorMessage(null);
          setOpenDetailsModal(false);
        }}
        onDismiss={() => {
          setDetailsModalData(null);
          setErrorMessage(null);
          setOpenDetailsModal(false);
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
              onPress={toggleDetailsModal}
            >
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableRipple>
            <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
          </View>
          <FlatList
            data={[detailsModalData]}
            keyExtractor={() => detailsModalData?.uri.split("#")[1]}
            showsVerticalScrollIndicator={false}
            renderItem={(item) => (
              <View key={item.index} style={{ paddingTop: 15 }}>
                <Image
                  style={{
                    width: "100%",
                    height: 350,
                    resizeMode: "contain",
                  }}
                  source={{ uri: `${detailsModalData?.image}` }}
                />
                <View style={{ gap: 20, paddingVertical: 10 }}>
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <HeaderText style={{ fontSize: 24, flex: 2 }}>
                        {detailsModalData?.label}
                      </HeaderText>
                      <View>
                        {checkSaved(detailsModalData?.uri.split("#")[1]) ? (
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
                                recipe_id: detailsModalData?.uri.split("#")[1],
                              });
                            }}
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
                                recipe_id: detailsModalData?.uri.split("#")[1],
                                recipe_name: detailsModalData?.label,
                                ingredients: detailsModalData?.ingredientLines,
                                servings: detailsModalData?.yield,
                                cooking_time: detailsModalData?.totalTime,
                                tags: getTags(detailsModalData),
                                calories: convertMetric(
                                  detailsModalData?.calories,
                                  detailsModalData?.yield
                                ),
                                carbs: convertMetric(
                                  detailsModalData?.totalNutrients.CHOCDF
                                    .quantity,
                                  detailsModalData?.yield
                                ),
                                protein: convertMetric(
                                  detailsModalData?.totalNutrients.PROCNT
                                    .quantity,
                                  detailsModalData?.yield
                                ),
                                fat: convertMetric(
                                  detailsModalData?.totalNutrients.FAT.quantity,
                                  detailsModalData?.yield
                                ),
                                instruction_link: detailsModalData?.url,
                                img_url: detailsModalData?.image,
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
                    <SubHeaderText style={{ color: colors.gray }}>
                      Cooking time: {detailsModalData?.totalTime} mins
                    </SubHeaderText>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <SubHeaderText>Tags: </SubHeaderText>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ paddingHorizontal: 5 }}
                      data={getTags(detailsModalData)}
                      keyExtractor={(item, index) => index}
                      renderItem={({ item }) => (
                        <View style={styles.tag} key={item.key}>
                          <BodyText style={{ color: colors.white }}>
                            {item.label}
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
                          {convertMetric(
                            detailsModalData?.calories,
                            detailsModalData?.yield
                          ).toLocaleString()}
                        </HeaderText>
                        <BodyText style={{ color: colors.warning.normal }}>
                          Cal
                        </BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#00bfbf" }}>
                          {convertMetric(
                            detailsModalData?.totalNutrients.CHOCDF.quantity,
                            detailsModalData?.yield
                          )}
                          g
                        </HeaderText>
                        <BodyText style={{ color: "#00bfbf" }}>Carbs</BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#6a607b" }}>
                          {convertMetric(
                            detailsModalData?.totalNutrients.FAT.quantity,
                            detailsModalData?.yield
                          )}
                          g
                        </HeaderText>
                        <BodyText style={{ color: "#6a607b" }}>Fat</BodyText>
                      </View>
                      <View style={styles.nutrientsContainer}>
                        <HeaderText style={{ fontSize: 21, color: "#cd7f32" }}>
                          {convertMetric(
                            detailsModalData?.totalNutrients.PROCNT.quantity,
                            detailsModalData?.yield
                          )}
                          g
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
                    {detailsModalData?.ingredientLines.map((item, index) => (
                      <BodyText key={index}>{item}</BodyText>
                    ))}
                  </View>

                  <View style={{ gap: 5 }}>
                    <BodyText>For cooking instructions, do visit: </BodyText>
                    <LinkText href={detailsModalData?.url}>
                      {detailsModalData?.url}
                    </LinkText>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
      <MainContainer padding={15} gap={20}>
        <View>
          <SubHeaderText>What are you looking for?</SubHeaderText>
          <Searchbar
            placeholder="Search recipes"
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
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
            editable={!isDisabled}
            loading={isLoading}
            onIconPress={onSearch}
            onEndEditing={onSearch}
          />
          {searchResults && (
            <View
              style={{
                marginTop: 15,
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                onPress={() => {
                  setErrorMessage(null);
                  setSearchResults(null);
                }}
              >
                <BodyText
                  style={{ textAlign: "right", color: colors.primary.dark }}
                >
                  Clear
                </BodyText>
              </Pressable>
            </View>
          )}
        </View>
        {searchResults == null ? (
          <View style={{ gap: 8 }}>
            <OptionsContainer
              title={"Breakfast"}
              color={colors.orange.normal}
              desc={"Find breakfast recipes here."}
              onPress={() => getSelectedMeal({ meal: "Breakfast" })}
            >
              <Image
                source={breakfast}
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "cover",
                }}
              />
            </OptionsContainer>
            <OptionsContainer
              title={"Lunch"}
              color={colors.secondary.normal}
              desc={"Find lunch recipes here."}
              onPress={() => getSelectedMeal({ meal: "Lunch" })}
            >
              <Image
                source={lunch}
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "cover",
                }}
              />
            </OptionsContainer>
            <OptionsContainer
              title={"Snacks"}
              color={colors.warning.normal}
              desc={"Find snacks recipes here."}
              onPress={() => getSelectedMeal({ meal: "Snack" })}
            >
              <Image
                source={snacks}
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "cover",
                }}
              />
            </OptionsContainer>
            <OptionsContainer
              title={"Dinner"}
              color={colors.info.normal}
              desc={"Find dinner recipes here."}
              onPress={() => getSelectedMeal({ meal: "Dinner" })}
            >
              <Image
                source={dinner}
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "cover",
                }}
              />
            </OptionsContainer>
          </View>
        ) : searchResults != null && searchResults?.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={searchResults.slice(
                (currentPage - 1) * resultsPerPage,
                currentPage * resultsPerPage
              )}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.recipe.uri.split("#")[1]}
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
              renderItem={(item) => (
                <CardOption
                  showBookmark={true}
                  style={{ marginBottom: 5 }}
                  key={item.index}
                  gifUrl={item.item.recipe.image}
                  title={item.item.recipe.label}
                  desc={`${convertMetric(
                    item.item.recipe.calories,
                    item.item.recipe.yield
                  ).toLocaleString()} cals`}
                  onPress={() => {
                    setDetailsModalData(item.item.recipe);
                    setOpenDetailsModal(true);
                  }}
                  isSaved={checkSaved(item.item.recipe.uri.split("#")[1])}
                  handleSave={() =>
                    onSave({
                      recipe_id: item.item.recipe.uri.split("#")[1],
                      recipe_name: item.item.recipe.label,
                      ingredients: item.item.recipe.ingredientLines,
                      servings: item.item.recipe.yield,
                      cooking_time: item.item.recipe.totalTime,
                      tags: getTags(item.item.recipe),
                      calories: convertMetric(
                        item.item.recipe.calories,
                        item.item.recipe.yield
                      ),
                      carbs: convertMetric(
                        item.item.recipe.totalNutrients.CHOCDF.quantity,
                        item.item.recipe.yield
                      ),
                      protein: convertMetric(
                        item.item.recipe.totalNutrients.PROCNT.quantity,
                        item.item.recipe.yield
                      ),
                      fat: convertMetric(
                        item.item.recipe.totalNutrients.FAT.quantity,
                        item.item.recipe.yield
                      ),
                      instruction_link: item.item.recipe.url,
                      img_url: item.item.recipe.image,
                    })
                  }
                  handleRemove={() => {
                    onRemove({
                      user_id: currentUser?.user_id,
                      recipe_id: item.item.recipe.uri.split("#")[1],
                    });
                  }}
                ></CardOption>
              )}
            />
          </>
        ) : (
          <View
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <SubHeaderText style={{ fontSize: 18, textAlign: "center" }}>
              No results found.
            </SubHeaderText>
          </View>
        )}
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
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
  optionContainer: {
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "#e3e3e3",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default recipes;
