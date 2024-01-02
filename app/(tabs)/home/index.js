import { Feather, FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import CircularProgress from "react-native-circular-progress-indicator";
import { Searchbar } from "react-native-paper";
import steps from "../../../assets/images/steps.png";
import MainContainer from "../../../components/MainContainer";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInUp,
} from "react-native-reanimated";
import {
  BodyText,
  HeaderText,
  LinkText,
  SubHeaderText,
} from "../../../components/StyledText";
import { colors } from "../../../helpers/theme";
import { useNavigation } from "expo-router";

const index = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ["Jan", "Feb", "March", "April", "May", "June"],
    datasets: [
      {
        data: [50, 52, 58, 60, 62, 65],
        color: (opacity = 1) => `rgba(29, 215, 91, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.white,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
    strokeWidth: 5,
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      entering={FadeInUp.springify()}
    >
      <MainContainer gap={25}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <HeaderText
            style={{
              fontSize: 18,
            }}
          >
            Hello, Yashil
          </HeaderText>
          <View>
            <HeaderText
              style={{
                fontSize: 18,
                textAlign: "right",
              }}
            >
              {date.format("hh:mm A")}
            </HeaderText>
            <BodyText style={{ color: colors.gray }}>
              {date.format("dddd, MMMM D")}
            </BodyText>
          </View>
        </View>
        {/* Search bar */}
        <Animated.View entering={FadeInDown.stiffness()}>
          <Pressable
            onPress={() => {
              navigation.navigate("(diary)", { screen: "searchFood" });
            }}
          >
            <Searchbar
              placeholder="Search food"
              style={{ borderRadius: 6, backgroundColor: "#f2f2f2" }}
              iconColor={colors.primary.normal}
            />
          </Pressable>
        </Animated.View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <HeaderText style={{ fontSize: 18 }}>Membership:</HeaderText>
          <View
            style={{
              backgroundColor: colors.success.light,
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderColor: colors.success.normal,
              borderWidth: 2,
            }}
          >
            <BodyText>28 Days Left</BodyText>
          </View>
        </View>
        {/* Calories Container */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View
            style={{
              padding: 15,
              borderRadius: 6,
              padding: 20,
              borderWidth: 1,
              borderColor: "#e3e3e3",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <HeaderText style={{ fontSize: 18, marginBottom: 5 }}>
                Calories
              </HeaderText>
              <LinkText href="" style={{ paddingBottom: 10 }}>
                View Details
              </LinkText>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <CircularProgress
                  value={1440}
                  maxValue={2550}
                  radius={78}
                  activeStrokeColor={colors.primary.normal}
                  inActiveStrokeColor={colors.primary.dark}
                  inActiveStrokeOpacity={0.2}
                  inActiveStrokeWidth={15}
                  activeStrokeWidth={20}
                  title="Remaining"
                  titleColor={colors.black}
                  titleStyle={{
                    color: "gray",
                    fontSize: 14,
                    fontFamily: "Figtree",
                  }}
                  progressValueStyle={{
                    color: colors.black,
                    fontSize: 28,
                    fontFamily: "Poppins-Bold",
                  }}
                />
              </View>
              <View
                style={{ alignItems: "flex-end", justifyContent: "flex-end" }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Feather name="target" size={25} color="red" />
                  <SubHeaderText style={{ fontSize: 18 }}>
                    Daily Goal:
                  </SubHeaderText>
                </View>
                <HeaderText style={{ fontSize: 32 }}>2550</HeaderText>
              </View>
            </View>
          </View>
        </Animated.View>
        {/* Steps and Calories card */}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Animated.View
            entering={FadeInLeft.delay(200).springify()}
            style={{
              backgroundColor: colors.secondary.normal,
              flex: 1,
              borderRadius: 10,
              padding: 15,
            }}
          >
            <View style={{ alignItems: "flex-end" }}>
              <Image source={steps} width={60} height={60} />
            </View>
            <View>
              <SubHeaderText style={{ color: colors.white, fontSize: 18 }}>
                Steps
              </SubHeaderText>
              <HeaderText style={{ color: colors.white, fontSize: 32 }}>
                1,857
              </HeaderText>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInLeft.delay(200).springify()}
            style={{
              backgroundColor: colors.warning.normal,
              flex: 1,
              borderRadius: 10,
              padding: 15,
            }}
          >
            <View style={{ alignItems: "flex-end" }}>
              <FontAwesome5 name="fire-alt" size={60} color={colors.white} />
            </View>
            <View>
              <SubHeaderText style={{ color: colors.white, fontSize: 18 }}>
                Calories
              </SubHeaderText>
              <HeaderText style={{ color: colors.white, fontSize: 32 }}>
                530
              </HeaderText>
            </View>
          </Animated.View>
        </View>
        {/* Progress */}

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{
            borderWidth: 1,
            borderColor: "#e3e3e3",
            padding: 15,
            borderRadius: 10,
            gap: 15,
          }}
        >
          <HeaderText style={{ fontSize: 18 }}>Progress</HeaderText>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <SubHeaderText>Weight</SubHeaderText>
            <BodyText style={{ color: colors.gray }}>Last 90 Days</BodyText>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 15,
            }}
          >
            <LineChart
              data={data}
              width={(screenWidth * 3) / 4}
              height={256}
              chartConfig={chartConfig}
              bezier
            />
          </View>
        </Animated.View>
      </MainContainer>
    </Animated.ScrollView>
  );
};

export default index;
