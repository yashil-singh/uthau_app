import {
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import useGym from "../../../hooks/useGym";
import useDecode from "../../../hooks/useDecode";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { colors } from "../../../helpers/theme";
import StyledButton from "../../../components/StyledButton";
import { Portal, Snackbar, TouchableRipple } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import CardOption from "../../../components/CardOption";
import { Feather } from "@expo/vector-icons";

const diet = () => {
  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();
  const [memberDetails, setMemberDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const {
    getMemberById,
    getRecipeRecommendations,
    generateRecipeRecommendations,
  } = useGym();

  const [recommendations, setRecommendations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
        const memberResponse = await getMemberById({
          user_id: response.user.user_id,
        });
        if (memberResponse.success) {
          setMemberDetails(memberResponse.member);
        }
      }
    };

    fetchDecodedToken();
  }, [user]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handlePrevDay = () => {
    setSelectedDayIndex((prevIndex) => (prevIndex === 0 ? 6 : prevIndex - 1));
  };

  const handleNextDay = () => {
    setSelectedDayIndex((prevIndex) => (prevIndex === 6 ? 0 : prevIndex + 1));
  };

  const fetchRecommendations = async () => {
    if (currentUser && memberDetails) {
      const response = await getRecipeRecommendations({
        member_id: memberDetails?.member_id,
      });
      if (response.success) {
        setRecommendations(response.data);
      }
      setIsLoading(false);
    }
  };

  const filteredData = recommendations.filter(
    (recipe, index) => index % 7 === selectedDayIndex
  );

  useEffect(() => {
    fetchRecommendations();
  }, [currentUser, memberDetails]);

  const generateRecommendations = async () => {
    if (currentUser && memberDetails) {
      setIsSubmitting(true);
      const response = await generateRecipeRecommendations({
        member_id: memberDetails?.member_id,
      });
      if (response.success) {
        setSelectedDayIndex(0);
        fetchRecommendations();
      }
      setOpenToast(true);
      setToastMessage(response.message);
      setIsSubmitting(false);
    }
  };

  return (
    <MainContainer padding={15}>
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
          duration={3000}
          style={{ backgroundColor: colors.white }}
        >
          <BodyText>{toastMessage}</BodyText>
        </Snackbar>
      </Portal>

      <Modal
        animationType="slide"
        visible={openDetailsModal}
        onDismiss={() => {
          setOpenDetailsModal(false);
          setSelectedRecipe(null);
        }}
        onRequestClose={() => {
          setOpenDetailsModal(false);
          setSelectedRecipe(null);
        }}
      >
        <ScrollView
          style={{ padding: 15 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 15,
          }}
          stickyHeaderIndices={[0]}
          StickyHeaderComponent={() => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 30,
              }}
            >
              <TouchableRipple
                borderless
                style={{ borderRadius: 100 }}
                onPress={() => {
                  setOpenDetailsModal(false);
                  setSelectedRecipe(null);
                }}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableRipple>
              <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
            </View>
          )}
        >
          <View></View>
          <Image
            style={{
              width: "100%",
              height: 350,
              resizeMode: "contain",
            }}
            source={{ uri: `${selectedRecipe?.img_url}` }}
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
                  {selectedRecipe?.recipe_name}
                </HeaderText>
              </View>
              <SubHeaderText style={{ color: colors.gray }}>
                Cooking time: {parseFloat(selectedRecipe?.cook_time).toFixed()}{" "}
                mins
              </SubHeaderText>
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
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <HeaderText
                    style={{ fontSize: 21, color: colors.warning.normal }}
                  >
                    {parseFloat(selectedRecipe?.calories).toFixed()}
                  </HeaderText>
                  <BodyText style={{ color: colors.warning.normal }}>
                    kcals
                  </BodyText>
                </View>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <HeaderText style={{ fontSize: 21, color: "#00bfbf" }}>
                    {parseFloat(selectedRecipe?.carbs).toFixed()}g
                  </HeaderText>
                  <BodyText style={{ color: "#00bfbf" }}>Carbs</BodyText>
                </View>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <HeaderText style={{ fontSize: 21, color: "#6a607b" }}>
                    {parseFloat(selectedRecipe?.fat).toFixed()}g
                  </HeaderText>
                  <BodyText style={{ color: "#6a607b" }}>Fat</BodyText>
                </View>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <HeaderText style={{ fontSize: 21, color: "#cd7f32" }}>
                    {parseFloat(selectedRecipe?.protein).toFixed()}g
                  </HeaderText>
                  <BodyText style={{ color: "#cd7f32" }}>Protein</BodyText>
                </View>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <HeaderText style={{ fontSize: 20 }}>Ingredients</HeaderText>
              {selectedRecipe?.ingredients.map((item, index) => (
                <BodyText key={index}>{item}</BodyText>
              ))}
            </View>

            <View style={{ gap: 5 }}>
              <BodyText>For cooking instructions, do visit: </BodyText>
              <LinkText href={selectedRecipe?.instruction_link}>
                {selectedRecipe?.instruction_link}
              </LinkText>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          ListEmptyComponent={() => (
            <>
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <HeaderText>Oops! It's a bit empty here.</HeaderText>
                  <BodyText style={{ color: colors.gray }}>
                    Get your meal plan recommendations right now!
                  </BodyText>
                </View>
                <StyledButton
                  title={"Get Recommendations"}
                  style={{ width: "100%" }}
                  onPress={generateRecommendations}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                />
              </View>
            </>
          )}
          contentContainerStyle={{
            flexGrow: 1,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={isListLoading}
          onRefresh={fetchRecommendations}
          ListHeaderComponent={() => (
            <>
              {recommendations.length !== 0 && (
                <StyledButton
                  title={"Update Recommendations"}
                  onPress={generateRecommendations}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                />
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 15,
                }}
              >
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={handlePrevDay}
                  disabled={selectedDayIndex <= 0}
                >
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={selectedDayIndex <= 0 ? colors.gray : colors.black}
                  />
                </TouchableRipple>
                <HeaderText>{daysOfWeek[selectedDayIndex]}</HeaderText>
                <TouchableRipple
                  borderless
                  style={{ borderRadius: 100, padding: 5 }}
                  onPress={handleNextDay}
                  disabled={selectedDayIndex > daysOfWeek.length - 2}
                >
                  <Entypo
                    name="chevron-right"
                    size={24}
                    color={
                      selectedDayIndex > daysOfWeek.length - 2
                        ? colors.gray
                        : colors.black
                    }
                  />
                </TouchableRipple>
              </View>
            </>
          )}
          renderItem={({ index, item }) => (
            <CardOption
              key={index}
              gifUrl={item.img_url}
              target={item.target}
              title={item.recipe_name}
              desc={`${parseFloat(
                item.calories
              ).toFixed()} kcals\nCook Time: ${parseFloat(
                item.cook_time
              ).toFixed()} mins`}
              onPress={() => {
                setOpenDetailsModal(true);
                setSelectedRecipe(item);
              }}
            />
          )}
        />
      )}
    </MainContainer>
  );
};

export default diet;
