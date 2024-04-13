import { Slot } from "expo-router";
import { FontProvider } from "../context/FontContext";
import { AuthContextProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";

export default function Root() {
  return (
    <AuthContextProvider>
      <FontProvider>
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </FontProvider>
    </AuthContextProvider>
  );
}
