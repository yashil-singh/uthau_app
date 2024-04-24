import { ActivityIndicator, View } from "react-native";
import React, { useEffect, useState } from "react";
import OptionsContainer from "../../../components/OptionsContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../../helpers/theme";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../../hooks/useAuthContext";
import useDecode from "../../../hooks/useDecode";

const index = () => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  const { getDecodedToken } = useDecode();

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

  return (
    <>
      {isPageLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.primary.normal} size={"large"} />
        </View>
      ) : (
        <View
          style={{
            padding: 15,
            flex: 1,
            backgroundColor: colors.white,
            gap: 10,
          }}
        >
          <OptionsContainer
            title="Exercises"
            color={colors.info.dark}
            desc="Search from a collection of exercises here."
            onPress={() => router.push("discover/exercises")}
          >
            <MaterialCommunityIcons
              name="weight-lifter"
              size={30}
              color="white"
            />
          </OptionsContainer>

          <OptionsContainer
            title="Recipes"
            color={colors.orange.normal}
            desc="Search from a collection of recipes here."
            onPress={() => router.push("discover/recipes")}
          >
            <MaterialIcons name="my-library-books" size={30} color="white" />
          </OptionsContainer>
          {currentUser?.role === "normal" || currentUser?.role === "member" ? (
            <>
              <OptionsContainer
                title="Find Partner"
                color={colors.secondary.normal}
                desc="Search for gym partners to get gains together."
                onPress={() => router.push("discover/partner")}
              >
                <MaterialIcons name="person-search" size={30} color="white" />
              </OptionsContainer>

              <OptionsContainer
                title="Fitness Competitons"
                color={colors.warning.normal}
                desc="Join fitness competitions now for a chance to win cash prizes or gifts."
                onPress={() => router.push("discover/competition")}
              >
                <MaterialCommunityIcons name="medal" size={30} color="white" />
              </OptionsContainer>

              <OptionsContainer
                title="ARScan"
                color={colors.error.normal}
                desc="Complete goals and get points here."
                onPress={() => router.push("discover/ar")}
              >
                <MaterialIcons name="videogame-asset" size={30} color="white" />
              </OptionsContainer>
            </>
          ) : (
            <></>
          )}
        </View>
      )}
    </>
  );
};

export default index;
