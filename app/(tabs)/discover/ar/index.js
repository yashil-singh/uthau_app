import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import MainContainer from "../../../../components/MainContainer";
import { BodyText, HeaderText } from "../../../../components/StyledText";
import { colors } from "../../../../helpers/theme";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useUsers } from "../../../../hooks/useUsers";
import useDecode from "../../../../hooks/useDecode";
import { useAuthContext } from "../../../../hooks/useAuthContext";
const index = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { getStepLogs, getArPoints } = useUsers();
  const { getDecodedToken } = useDecode();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState([]);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [totalPoints, setTotalPoints] = useState("");

  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const fetchDecodedToken = async () => {
      const response = await getDecodedToken();

      if (response.success) {
        setCurrentUser(response?.user);
      }
    };

    fetchDecodedToken();
  }, [user]);

  const fetchStepLogs = async () => {
    if (currentUser && isLoading) {
      const response = await getStepLogs({ user_id: currentUser?.user_id });
      console.log("🚀 ~ response:", response);

      if (response.success) {
        const logs = response.data[0];
        const steps = logs.steps;
        const claimed = logs.claimed;
        setClaimed(claimed);

        if (steps > 10000 && !claimed) {
          setIsCameraVisible(true);
        }
        setPoints(logs);
      }
      setIsLoading(false);
    }
  };

  const fetchArPoints = async () => {
    if (currentUser) {
      const response = await getArPoints({ user_id: currentUser?.user_id });

      if (response.success) {
        setTotalPoints(response.totalPoints);
      }
    }
  };

  useFocusEffect(() => {
    fetchStepLogs();
    fetchArPoints();
  });
  return (
    <MainContainer padding={15}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={"large"} color={colors.primary.normal} />
        </View>
      ) : (
        <>
          <HeaderText style={{ fontSize: 16, textAlign: "center" }}>
            Welcome to the AR World!
          </HeaderText>
          <BodyText style={{ color: colors.gray, textAlign: "center" }}>
            Collect points for completing your step goal.
          </BodyText>

          <HeaderText
            style={{ textAlign: "center", fontSize: 16, marginVertical: 20 }}
          >
            Your Total Points: {totalPoints}
          </HeaderText>
          <HeaderText style={{ marginBottom: 20 }}>Challenges/Goals</HeaderText>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <BodyText>Steps</BodyText>
            {claimed ? (
              <BodyText style={{ color: colors.primary.normal }}>
                Claimed!
              </BodyText>
            ) : (
              <BodyText>{points?.steps}/10000</BodyText>
            )}
          </View>
          {isCameraVisible && (
            <>
              <BodyText
                style={{
                  position: "absolute",
                  bottom: 60,
                  right: 30,
                  fontSize: 10,
                }}
              >
                You have completed a goal, claim {"\n"}your points here.
              </BodyText>
              <TouchableOpacity
                style={{
                  borderRadius: 100,
                  padding: 10,
                  backgroundColor: colors.primary.normal,
                  width: 45,
                  position: "absolute",
                  bottom: 15,
                  right: 15,
                }}
                activeOpacity={0.8}
                onPress={() => router.push("/discover/ar/camera")}
              >
                <Feather name="camera" size={24} color={colors.white} />
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </MainContainer>
  );
};

export default index;
