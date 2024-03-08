import { createContext, useContext } from "react";
import { useFonts } from "expo-font";

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins.ttf"),
    Figtree: require("../assets/fonts/Figtree.ttf"),
    "Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FontContext.Provider value={{ fontsLoaded }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFontsContext = () => {
  return useContext(FontContext);
};
