import {
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import {
  BodyText,
  HeaderText,
  SubHeaderText,
} from "../../../components/StyledText";
import { useAuthContext } from "../../../hooks/useAuthContext";
import useDecode from "../../../hooks/useDecode";
import useGym from "../../../hooks/useGym";
import { colors } from "../../../helpers/theme";
import StyledButton from "../../../components/StyledButton";
import { Snackbar, Portal, TouchableRipple } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import formatWord from "../../../helpers/formatWord";
import CardOption from "../../../components/CardOption";
import { AntDesign } from "@expo/vector-icons";

const exercises = () => {
  const { user } = useAuthContext();
  const { getDecodedToken } = useDecode();
  const {
    getExerciseRecommendations,
    getMemberById,
    generateExerciseRecommendations,
  } = useGym();

  const [currentUser, setCurrentUser] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [bodyPart, setBodyPart] = useState([]);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentPageTitle = bodyPart[currentPageIndex];

  const [selectedExercise, setSelectedExercise] = useState(null);

  const [openDetailsModal, setOpenDetailsModal] = useState(false);

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

  const fetchRecommendations = async () => {
    if (currentUser && memberDetails) {
      if (!isPageLoading) {
        setIsListLoading(true);
      }
      const response = await getExerciseRecommendations({
        member_id: memberDetails?.member_id,
      });
      if (response.success) {
        setRecommendations(response.data);
        const bodyParts = new Set(
          response.data.map((exercise) => exercise.body_part)
        );
        setBodyPart([...bodyParts]);
      }
      setIsListLoading(false);
      setIsPageLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (currentUser && memberDetails) {
      setIsSubmitting(true);
      const response = await generateExerciseRecommendations({
        member_id: memberDetails?.member_id,
      });
      if (response.success) {
        fetchRecommendations();
      }
      setOpenToast(true);
      setToastMessage(response.message);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentUser, memberDetails]);

  const navigatePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      filterRecommendations();
    }
  };

  const navigateNext = () => {
    if (currentPageIndex < bodyPart.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      filterRecommendations();
    }
  };

  function filterRecommendations() {
    return recommendations.filter(
      (item) => item.body_part === currentPageTitle
    );
  }

  return (
    <MainContainer padding={15}>
      <Modal
        visible={openDetailsModal}
        animationType="slide"
        onDismiss={() => {
          setOpenDetailsModal(false);
          setSelectedExercise(null);
        }}
        onRequestClose={() => {
          setOpenDetailsModal(false);
          setSelectedExercise(null);
        }}
      >
        <View style={{ padding: 15 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 25,
              alignItems: "center",
            }}
          >
            <TouchableRipple
              borderless
              style={{ borderRadius: 100, padding: 5 }}
              onPress={() => {
                setOpenDetailsModal(false);
                setSelectedExercise(null);
              }}
            >
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableRipple>
            <HeaderText style={{ fontSize: 24 }}>Details</HeaderText>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
          >
            {selectedExercise?.image && (
              <Image
                source={{ uri: `${selectedExercise?.image}` }}
                style={{
                  width: "100%",
                  height: 350,
                  resizeMode: "contain",
                }}
              />
            )}

            <View style={{ gap: 5, marginBottom: 15 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <HeaderText style={{ fontSize: 24, flex: 2 }}>
                  {formatWord(selectedExercise?.name)}
                </HeaderText>
              </View>
              <SubHeaderText style={{ fontSize: 14 }}>
                Exercise Type: {selectedExercise?.body_part}
              </SubHeaderText>

              <BodyText>
                <SubHeaderText style={{ fontSize: 12 }}>
                  Targeted muscle(s):
                </SubHeaderText>{" "}
                {selectedExercise?.target}
              </BodyText>
              <BodyText>
                <SubHeaderText style={{ fontSize: 12 }}>
                  Secondary muscle(s):
                </SubHeaderText>{" "}
                {selectedExercise?.secondary_muscles.map((item) => {
                  return `${item}, `;
                })}
              </BodyText>
            </View>

            <HeaderText style={{ fontSize: 18 }}>Instructions</HeaderText>
            {selectedExercise?.instructions.map((item, index) => (
              <BodyText key={index} style={{ marginBottom: 15 }}>
                {index + 1}. {item}
              </BodyText>
            ))}
          </ScrollView>
        </View>
      </Modal>
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <>
          <FlatList
            data={filterRecommendations()}
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
                      Get your exercise recommendations right now!
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
                {filterRecommendations().length !== 0 && (
                  <>
                    <StyledButton
                      title={"Update Recommendations"}
                      onPress={generateRecommendations}
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                    />

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
                        onPress={navigatePrev}
                        disabled={currentPageIndex < 1}
                      >
                        <Entypo
                          name="chevron-left"
                          size={24}
                          color={
                            currentPageIndex < 1 ? colors.gray : colors.black
                          }
                        />
                      </TouchableRipple>
                      <HeaderText>
                        {formatWord(
                          (currentPageTitle === "upper arms" && "arms") ||
                            (currentPageTitle === "upper legs" && "legs") ||
                            currentPageTitle
                        )}
                      </HeaderText>
                      <TouchableRipple
                        borderless
                        style={{ borderRadius: 100, padding: 5 }}
                        onPress={navigateNext}
                        disabled={currentPageIndex > bodyPart.length - 1}
                      >
                        <Entypo
                          name="chevron-right"
                          size={24}
                          color={
                            currentPageIndex > bodyPart.length - 1
                              ? colors.gray
                              : colors.black
                          }
                        />
                      </TouchableRipple>
                    </View>
                  </>
                )}
              </>
            )}
            renderItem={({ index, item }) => (
              <CardOption
                key={index}
                gifUrl={item.image}
                target={item.target}
                title={item.name}
                onPress={() => {
                  setOpenDetailsModal(true);
                  setSelectedExercise(item);
                }}
              />
            )}
          />
        </>
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
          duration={3000}
          style={{ backgroundColor: colors.white }}
        >
          <BodyText>{toastMessage}</BodyText>
        </Snackbar>
      </Portal>
    </MainContainer>
  );
};

export default exercises;
