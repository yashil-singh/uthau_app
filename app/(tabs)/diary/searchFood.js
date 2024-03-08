import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { Searchbar } from "react-native-paper";
import { colors } from "../../../helpers/theme";
import { BodyText, HeaderText } from "../../../components/StyledText";
import useFoodDiary from "../../../hooks/useFoodDiary";
import { FontAwesome } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";

const searchFood = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  const { searchFood } = useFoodDiary();
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [items, setItems] = useState([
    { label: "Select a meal", value: null },
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Snacks", value: "snacks" },
    { label: "Dinner", value: "dinner" },
  ]);
  const meals = [
    { label: "Select a meal", value: null },
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Snacks", value: "snacks" },
    { label: "Dinner", value: "dinner" },
  ];
  const handleValueChange = (itemValue, itemIndex) =>
    setSelectedMeal(itemValue);

  const onSubmit = async () => {
    try {
      setIsDisabled(true);
      setError(null);
      const response = await searchFood({ keyword: searchQuery });
      if (response.success) {
        // If the response is successful, update the state with the search results
        setSearchResults(response.data);
        if (searchQuery.length > 0 && response.data.length === 0) {
          // Display "No results found" if there are no search results
          setError("No results found");
        }
      } else {
        setError("Unexpected error occurred. Try again later.");
      }
      console.log(response);
      setIsDisabled(false);
    } catch (error) {
      console.log("🚀 ~ file: searchFood.js:23 ~ error:", error);
      setError("Unexpected error occured. Try again later.");
    }
  };
  return (
    <MainContainer gap={15}>
      <Searchbar
        placeholder="Search food"
        style={{ borderRadius: 6, backgroundColor: "#f2f2f2" }}
        iconColor={colors.primary.normal}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onIconPress={onSubmit}
        onClearIconPress={() => setSearchResults([])}
        editable={!isDisabled}
      />

      <View style={styles.container}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={meals}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select a meal"
          value={selectedMeal}
          onChange={(item) => {
            setSelectedMeal(item.value);
          }}
        />
      </View>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#e3e3e3",
                padding: 15,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
              key={item.id}
            >
              <HeaderText style={{ fontSize: 18 }}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </HeaderText>
              <FontAwesome name="plus" size={24} color={colors.primary.dark} />
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
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerStyles: {
    width: "50%",
    borderWidth: 1,
    borderColor: "#e3e3e3",
    borderRadius: 6,
    backgroundColor: colors.primary.normal,
  },
  dropdown: {
    height: 50,
    width: "50%",
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default searchFood;
