import { Slot } from "expo-router";
import { FontProvider } from "../context/FontContext";
import { AuthContextProvider } from "../context/AuthContext";

export default function Root() {
  return (
    <AuthContextProvider>
      <FontProvider>
        <Slot />
      </FontProvider>
    </AuthContextProvider>
  );
}
