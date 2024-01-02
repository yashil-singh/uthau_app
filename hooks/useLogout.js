import { useAuthContext } from "./useAuthContext";
import * as SecureStore from "expo-secure-store";

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    dispatch({ type: "LOGOUT" });
  };

  return { logout };
};
