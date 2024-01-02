import { View } from "react-native";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import Loader from "../../components/Loader";
import { colors } from "../../helpers/theme";

const loading = () => {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      navigation.navigate("(tabs)", { screen: "home" });
    } else {
      navigation.navigate("(auth)", { screen: "login" });
    }
  }, [user]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary.normal,
      }}
    >
      <Loader size="large" />
    </View>
  );
};

export default loading;
