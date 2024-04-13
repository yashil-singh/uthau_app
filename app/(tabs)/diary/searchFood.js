import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { Portal, Searchbar, Snackbar } from "react-native-paper";
import { colors } from "../../../helpers/theme";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import { FontAwesome } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import StyledButton from "../../../components/StyledButton";
import useFood from "../../../hooks/useFood";
import Toast from "../../../components/Toast";

const searchFood = () => {
  // Import hooks related to food
  const { searchFood, logFood } = useFood();

  // Get parameter values
  const { id, date } = useLocalSearchParams();

  // User's search query
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  // To store the search results
  const [searchResults, setSearchResults] = useState([]);

  // States related to messages to display
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [servingError, setServingError] = useState(null);

  // Modal related states
  const [openModal, setOpenModal] = useState(false);
  const [openQuantityModal, setOpenQuantityModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedServing, setSelectedServing] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [isLogDisabled, setIsLogDisabled] = useState(false);

  // States related to toast
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Nutrient values
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carbs, setCarbs] = useState(0);

  // When toggling the modal open/close
  const toggleModal = () => {
    setOpenModal(!openModal);
    setModalData(null);
    setQuantity("1");
    setAddError(null);
    setError(null);
    setSelectedMeal(null);
    setSelectedServing(null);
    setCalories(0);
    setCarbs(0);
    setFat(0);
    setProtein(0);
  };

  // When toggling the quantity modal open/close
  const toggleQuantityModal = () => {
    setServingError(null);
    if (quantity <= 0) {
      setServingError("Quantity must be greater than zero.");
      return;
    }
    setOpenQuantityModal(!openQuantityModal);
  };

  // Options for meals
  const meals = [
    { label: "Select a meal", value: null },
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Snacks", value: "snacks" },
    { label: "Dinner", value: "dinner" },
  ];

  // To filter out all the measures
  const getMeasures = (measures) => {
    if (!measures) return [];

    const filteredMeasures = measures.flatMap((measure) => {
      if (measure.qualified) {
        return measure.qualified.map((qualified) => ({
          label: `1.0 ${measure.label} ${qualified.qualifiers[0].label}`,
          weight: qualified.weight,
        }));
      } else {
        return [
          {
            label: `1.0 ${measure.label}`,
            weight: measure.weight,
          },
        ];
      }
    });
    // Add null value at the beginning of the array
    filteredMeasures.unshift({
      label: "Select a serving size",
      weight: null,
    });
    return filteredMeasures;
  };

  // To convert the nutrirtional values to the selected serving size and quantity
  const convertMetric = ({ convertingMetric }) => {
    if (!quantity || !selectedServing) {
      return 0;
    }

    try {
      const convertedQuantity = parseFloat(quantity);
      const convertedMetric =
        (convertingMetric / 100) * selectedServing * convertedQuantity;

      return convertedMetric;
    } catch (error) {
      setAddError("Invalid quantity entered.");
      return 0;
    }
  };

  // Use effect to change the nutritional values when the serving size or quantity is changed
  useEffect(() => {
    // Calculate nutrient values based on the converted metric
    const calculatedCalories = convertMetric({
      convertingMetric: modalData?.food.nutrients.ENERC_KCAL,
    });
    const calculatedProtein = convertMetric({
      convertingMetric: modalData?.food.nutrients.PROCNT,
    });
    const calculatedFat = convertMetric({
      convertingMetric: modalData?.food.nutrients.FAT,
    });
    const calculatedCarbs = convertMetric({
      convertingMetric: modalData?.food.nutrients.CHOCDF,
    });

    setCalories(calculatedCalories.toFixed(1));
    setProtein(calculatedProtein.toFixed(1));
    setFat(calculatedFat.toFixed(1));
    setCarbs(calculatedCarbs.toFixed(1));
  }, [selectedServing, quantity]);

  // Get search results for user's query
  const onSearch = async () => {
    try {
      setSearchResults([]);
      setIsDisabled(true);
      setError(null);
      const response = await searchFood({ searchQuery });

      if (response.success) {
        // If the response is successful, update the state with the search results
        const foodData = response?.data.hints;

        const foodMap = new Map();

        const uniqueFood = foodData.filter((food) => {
          if (!foodMap.has(food.food.foodId)) {
            foodMap.set(food.food.foodId, true);
            return true;
          }

          return false;
        });

        setSearchResults(uniqueFood);
        if (searchQuery.length > 0 && response.data.length === 0) {
          // Display "No results found" if there are no search results
          setError("No results found");
        }
      } else {
        setError("Unexpected error occurred. Try again later.");
      }
      setIsDisabled(false);
    } catch (error) {
      console.log("🚀 ~ file: searchFood.js:23 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };

  // To log the food
  const onLogFood = async () => {
    setIsLogDisabled(true);
    setIsLogLoading(true);
    if (selectedMeal == null) {
      setAddError("Please select a meal");
      setIsLogDisabled(false);
      setIsLogLoading(false);
      return;
    } else if (selectedServing == null) {
      setAddError("Please select a serving size");
      setIsLogDisabled(false);
      setIsLogLoading(false);
      return;
    } else if (quantity <= 0) {
      setAddError("Quantity must be greater than zero.");
      setIsLogDisabled(false);
      setIsLogLoading(false);
      return;
    }
    try {
      if (modalData == null || id == null || date == null) {
        setAddError("Cannot complete this request at the moment.");
        setIsLogDisabled(false);
        setIsLogLoading(false);
        return;
      }

      const response = await logFood({
        user_id: id,
        date,
        foodId: modalData?.food.foodId || null,
        label: modalData?.food.label || null,
        calories,
        carbs,
        fat,
        protein,
        quantity,
        selectedMeal,
      });

      if (response.success) {
        setAddError(null);
        setIsLogDisabled(false);
        setIsLogLoading(false);
        setToastMessage("Food logged successfully!");
      } else {
        setToastMessage(response.error);
      }
      setOpenToast(true);

      closeToast();
      setOpenModal(false);
      setAddError("Cannot complete this request at the moment.");
      setIsLogDisabled(false);
      setIsLogLoading(false);
    } catch (error) {
      console.log("🚀 ~ error searchFood.js line 406:", error);
      setError("Unexpected error occured. Try again later.");
    }
    setCalories(0);
    setCarbs(0);
    setFat(0);
    setProtein(0);
    setQuantity(1);
    setSelectedMeal(null);
    setSelectedServing(null);
    setOpenModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      extraHeight={180}
      enableOnAndroid={true}
    >
      <Modal
        transparent
        animationType="fade"
        visible={openModal}
        onRequestClose={toggleModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingVertical: 50,
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              flex: 1,
              width: "100%",
              borderRadius: 6,
              padding: 15,
              gap: 15,
              justifyContent: "space-between",
            }}
          >
            <View style={{ gap: 15 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Feather
                  name="x"
                  size={25}
                  color={colors.primary.dark}
                  onPress={toggleModal}
                />
              </View>
              <View>
                <HeaderText style={{ fontSize: 21 }}>
                  {modalData?.food.label}
                </HeaderText>
                <BodyText>Also known as: {modalData?.food.knownAs}</BodyText>
              </View>

              <View style={styles.optionContainer}>
                <SubHeaderText>Meal</SubHeaderText>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={meals}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a meal"
                  value={selectedMeal}
                  onChange={(item) => {
                    setSelectedMeal(item.value);
                  }}
                  renderRightIcon={() => null}
                />
              </View>
              <View style={styles.optionContainer}>
                <SubHeaderText>Quantity</SubHeaderText>
                <Pressable onPress={() => setOpenQuantityModal(true)}>
                  <BodyText style={{ color: colors.info.dark }}>
                    {quantity}
                  </BodyText>
                </Pressable>
              </View>
              <View style={styles.optionContainer}>
                <SubHeaderText>Serving Size</SubHeaderText>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={getMeasures(modalData?.measures)}
                  maxHeight={500}
                  labelField="label"
                  valueField="weight"
                  placeholder="Select a serving size"
                  value={selectedServing}
                  onChange={(item) => {
                    setSelectedServing(item.weight);
                  }}
                  renderRightIcon={() => null}
                />
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.background,
                  paddingHorizontal: 15,
                  paddingVertical: 25,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  gap: 25,
                  borderRadius: 6,
                }}
              >
                <View style={styles.nutrientsContainer}>
                  <HeaderText
                    style={{ fontSize: 21, color: colors.warning.normal }}
                  >
                    {calories}
                  </HeaderText>
                  <BodyText style={{ color: colors.warning.normal }}>
                    Cal
                  </BodyText>
                </View>
                <View style={styles.nutrientsContainer}>
                  <HeaderText style={{ fontSize: 21, color: "#00bfbf" }}>
                    {carbs}g
                  </HeaderText>
                  <BodyText style={{ color: "#00bfbf" }}>Carbs</BodyText>
                </View>
                <View style={styles.nutrientsContainer}>
                  <HeaderText style={{ fontSize: 21, color: "#6a607b" }}>
                    {fat}g
                  </HeaderText>
                  <BodyText style={{ color: "#6a607b" }}>Fat</BodyText>
                </View>
                <View style={styles.nutrientsContainer}>
                  <HeaderText style={{ fontSize: 21, color: "#cd7f32" }}>
                    {protein}g
                  </HeaderText>
                  <BodyText style={{ color: "#cd7f32" }}>Protein</BodyText>
                </View>
              </View>
            </View>
            <View style={{ gap: 15 }}>
              <BodyText
                style={{ color: colors.error.normal, textAlign: "center" }}
              >
                {addError}
              </BodyText>
              <StyledButton
                title="Log Food"
                onPress={onLogFood}
                isDisabled={isLogDisabled}
                isLoading={isLogLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={openQuantityModal}
        onRequestClose={toggleQuantityModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingVertical: 50,
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              width: "100%",
              borderRadius: 6,
              padding: 15,
              gap: 15,
            }}
          >
            <HeaderText>How Much?</HeaderText>
            <BodyText
              style={{ color: colors.error.normal, textAlign: "center" }}
            >
              {servingError}
            </BodyText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 5,
              }}
            >
              <TextInput
                keyboardType="numeric"
                value={quantity}
                style={{
                  borderWidth: 1,
                  borderColor: "#e3e3e3",
                  paddingHorizontal: 8,
                  textAlign: "center",
                  borderRadius: 6,
                  flex: 1,
                }}
                onChangeText={(text) => setQuantity(text)}
              />
              <BodyText style={{ flex: 1 }}>{`Serving(s) of`}</BodyText>
            </View>
            <Dropdown
              style={{ ...styles.dropdown, width: "100%" }}
              placeholderStyle={{
                ...styles.placeholderStyle,
                textAlign: "left",
              }}
              selectedTextStyle={{
                ...styles.selectedTextStyle,
                textAlign: "left",
              }}
              data={getMeasures(modalData?.measures)}
              maxHeight={500}
              labelField="label"
              valueField="weight"
              placeholder="Select a serving size"
              value={selectedServing}
              onChange={(item) => {
                setSelectedServing(item.weight);
              }}
            />
            <Pressable
              onPress={() => {
                toggleQuantityModal();
              }}
            >
              <BodyText
                style={{ color: colors.primary.normal, textAlign: "right" }}
              >
                Ok
              </BodyText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <MainContainer gap={15} padding={15}>
        <View>
          <SubHeaderText>What are you looking for?</SubHeaderText>
          <Searchbar
            placeholder="Search food"
            style={{ borderRadius: 6, backgroundColor: "#f2f2f2" }}
            inputStyle={{ fontSize: 14 }}
            iconColor={colors.primary.normal}
            onChangeText={onChangeSearch}
            value={searchQuery}
            onIconPress={onSearch}
            editable={!isDisabled}
            loading={isDisabled}
            onEndEditing={onSearch}
          />
        </View>

        {searchResults.length > 0 && (
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
        )}

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setModalData(item);
                  setOpenModal(true);
                }}
                key={index}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#e3e3e3",
                    padding: 15,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    borderRadius: 6,
                    gap: 5,
                  }}
                >
                  <View>
                    <HeaderText
                      ellipsis="tail"
                      numOfLines={1}
                      style={{ fontSize: 18 }}
                    >
                      {item.food.label}
                    </HeaderText>
                    <BodyText style={{ color: colors.gray }}>
                      {item.food.knownAs}
                    </BodyText>
                  </View>
                  <FontAwesome
                    name="plus"
                    size={24}
                    color={colors.primary.dark}
                  />
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {error && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 100,
            }}
          >
            <BodyText style={{ textAlign: "center", fontSize: 18 }}>
              No results found.
            </BodyText>
          </View>
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
    </KeyboardAvoidingView>
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
});

export default searchFood;
