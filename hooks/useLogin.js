import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";

const useLogin = () => {
  const { dispatch } = useAuthContext();
  const login = async ({ email, password, keepLoggedIn }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/login`, {
        email,
        password,
        keepLoggedIn,
      });
      const data = await response?.data;

      if (keepLoggedIn) {
        await SecureStore.setItemAsync("authToken", JSON.stringify(data));
      }

      dispatch({ type: "LOGIN", payload: data });

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };
  return { login };
};

export default useLogin;
