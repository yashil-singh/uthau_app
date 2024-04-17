import { Redirect, useRouter } from "expo-router";
import { useAuthContext } from "../hooks/useAuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../helpers/theme";
import { HeaderText } from "../components/StyledText";
import StyledButton from "../components/StyledButton";
import { Dimensions, Image, View } from "react-native";
import logo from "../assets/icon.png";
const Index = () => {
  const { user } = useAuthContext();

  const router = useRouter();

  if (user) {
    return <Redirect href={"/home"} />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 55,
        backgroundColor: colors.white,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Image
        style={{ width: Dimensions.get("window").width - 50, height: 300 }}
        source={logo}
      />
      <View style={{ width: "100%", gap: 15 }}>
        <StyledButton
          title={"Login"}
          style={{ width: "100%" }}
          onPress={() => router.push("/login")}
        />
        <StyledButton
          title={"Signup"}
          color={colors.white}
          textColor={colors.primary.normal}
          style={{ width: "100%" }}
          onPress={() => router.push("/register")}
        />
      </View>
    </SafeAreaView>
  );
};

export default Index;
