import { Slot } from "expo-router";
import { FontProvider } from "../context/FontContext";
import { AuthContextProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

export default function Root() {
  return (
    <AuthContextProvider>
      <FontProvider>
        <PaperProvider>
          <Slot />
          <StatusBar hidden={false} translucent={false} style="dark" />
        </PaperProvider>
      </FontProvider>
    </AuthContextProvider>
  );
}
