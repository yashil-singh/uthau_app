import { View, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "../../../components/MainContainer";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HeaderText, SubHeaderText } from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import CircularProgress from "react-native-circular-progress-indicator";
import MealTable from "../../../components/MealTable";
import StyledButton from "../../../components/StyledButton";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import decodeToken from "../../../helpers/decodeToken";
import { AntDesign } from "react-native-vector-icons";
import dayjs from "dayjs";
import useFoodDiary from "../../../hooks/useFoodDiary";

const foodLog = () => {
  const router = useRouter();

  const { user } = useAuthContext();

  const { getLoggedFood } = useFoodDiary();

  const [currentDate, setCurrentDate] = useState(dayjs());

  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const [loggedFoods, setLoggedFoods] = useState(null);
  const [mealTotals, setMealTotals] = useState(null);

  const handlePrevDay = () => {
    setCurrentDate(currentDate.subtract(1, "day"));
  };

  const handleNextDay = () => {
    setCurrentDate(currentDate.add(1, "day"));
  };

  const isToday = currentDate.isSame(dayjs(), "day");
  const formattedDate = isToday
    ? "Today"
    : currentDate.format("ddd MMM DD, YYYY");

  const decodedToken = decodeToken(user);
  const currentUser = decodedToken?.user;

  const user_id = currentUser?.user_id;

  const isTomorrow = currentDate < dayjs();

  useEffect(() => {
    const getFoods = async () => {
      setSelectedDate(currentDate.format("YYYY-MM-DD"));
      const date = currentDate.format("YYYY-MM-DD");

      const response = await getLoggedFood({ user_id, date });

      setLoggedFoods(response.data.result);
      setMealTotals(response.data.mealTotals);
    };

    getFoods();
  }, [currentDate]);

  let totalCaloriesSum = 0;

  // Calculate the sum of total_calories using forEach
  mealTotals?.forEach((item) => {
    const numericCalories = parseFloat(item.total_calories);
    totalCaloriesSum += isNaN(numericCalories) ? 0 : numericCalories;
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <MainContainer padding={15}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 25,
            gap: 25,
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={handlePrevDay} activeOpacity={0.8}>
              <AntDesign name="left" size={18} color="black" />
            </TouchableOpacity>

            <SubHeaderText style={{ fontSize: 18 }}>
              {formattedDate}
            </SubHeaderText>

            <TouchableOpacity onPress={handleNextDay} activeOpacity={0.8}>
              <AntDesign name="right" size={18} color="black" />
            </TouchableOpacity>
          </View>

          <SubHeaderText style={{ fontSize: 20, textAlign: "center" }}>
            You have {"\n"}{" "}
            <SubHeaderText style={{ color: colors.warning.normal }}>
              {Math.round(
                currentUser?.calorie_intake - totalCaloriesSum
              ).toLocaleString()}
            </SubHeaderText>{" "}
            cals remaining.
          </SubHeaderText>
          <View>
            <CircularProgress
              value={totalCaloriesSum}
              maxValue={currentUser?.calorie_intake}
              radius={100}
              activeStrokeColor={colors.primary.normal}
              inActiveStrokeColor={colors.primary.dark}
              inActiveStrokeOpacity={0.2}
              inActiveStrokeWidth={15}
              activeStrokeWidth={20}
              title="Completed"
              titleColor={colors.black}
              titleStyle={{
                color: "gray",
                fontSize: 16,
                fontFamily: "Figtree",
              }}
              progressValueStyle={{
                color: colors.black,
                fontSize: 30,
                fontFamily: "Poppins-Bold",
              }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather
              name="target"
              size={30}
              color="red"
              style={{ paddingBottom: 5 }}
            />
            <HeaderText style={{ fontSize: 24 }}>
              Daily Goal: {currentUser?.calorie_intake.toLocaleString()}
            </HeaderText>
          </View>
          <MealTable
            foodLogs={loggedFoods}
            mealType={"Breakfast"}
            mealTotals={mealTotals}
            showAdd={isTomorrow}
            user_id={user_id}
            date={selectedDate}
          />
          <MealTable
            foodLogs={loggedFoods}
            mealType={"Lunch"}
            mealTotals={mealTotals}
            showAdd={isTomorrow}
            user_id={user_id}
            date={selectedDate}
          />
          <MealTable
            foodLogs={loggedFoods}
            mealType={"Snacks"}
            mealTotals={mealTotals}
            showAdd={isTomorrow}
            user_id={user_id}
            date={selectedDate}
          />
          <MealTable
            foodLogs={loggedFoods}
            mealType={"Dinner"}
            mealTotals={mealTotals}
            showAdd={isTomorrow}
            user_id={user_id}
            date={selectedDate}
          />
        </View>
        <StyledButton
          title="Nutrition"
          onPress={() => router.push("/diary/nutrition")}
        >
          <MaterialCommunityIcons name="nutrition" size={25} color="white" />
        </StyledButton>
      </MainContainer>
    </ScrollView>
  );
};

export default foodLog;
