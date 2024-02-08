import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { Searchbar } from "react-native-paper";
import RecipeCard from "../../../components/RecipeCard";

const recipes = () => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSearch = () => {
    console.log(searchQuery);
  };

  const data = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "Grilled Chicken",
      cals: 2445,
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "Grilled Chicken",
      cals: 2445,
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571e29d72",
      title: "Grilled Chicken",
      cals: 2445,
    },
  ];
  return (
    <MainContainer padding={15} gap={25}>
      <View>
        <SubHeaderText>What are you looking for?</SubHeaderText>
        <Searchbar
          placeholder="Search recipes"
          style={{
            borderRadius: 6,
            backgroundColor: "#f2f2f2",
            display: "flex",
            alignItems: "center",
          }}
          inputStyle={{ fontSize: 14 }}
          iconColor={colors.primary.normal}
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          editable={!isDisabled}
          loading={isLoading}
          onIconPress={onSearch}
          onEndEditing={onSearch}
        />
      </View>
      <View>
        <View style={styles.dietHeader}>
          <HeaderText style={{ fontSize: 20 }}>High Protein</HeaderText>
          <BodyText style={{ color: colors.primary.normal }}>
            View More
          </BodyText>
        </View>
        <View style={{ gap: 10, flexDirection: "row" }}>
          <FlatList
            horizontal={true}
            data={data}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={(data) => (
              <View style={{ marginRight: 5 }}>
                <RecipeCard title={data.item.title} cals={data.item.cals} />
              </View>
            )}
          />
        </View>
      </View>
      <View>
        <View style={styles.dietHeader}>
          <HeaderText style={{ fontSize: 20 }}>Low Fat</HeaderText>
          <BodyText style={{ color: colors.primary.normal }}>
            View More
          </BodyText>
        </View>
      </View>
      <View>
        <View style={styles.dietHeader}>
          <HeaderText style={{ fontSize: 20 }}>Low Carbs</HeaderText>
          <BodyText style={{ color: colors.primary.normal }}>
            View More
          </BodyText>
        </View>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  dietHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default recipes;
