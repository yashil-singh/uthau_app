import { useContext } from "react";
import RegisterContext from "../context/RegisterContext";

export const useRegisterContext = () => {
  const context = useContext(RegisterContext);

  if (!context) {
    throw Error("RegisterContext must be inside an RegisterContextProvider");
  }

  return context;
};
