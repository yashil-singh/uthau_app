import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";

const useRegister = () => {
  const { dispatch } = useAuthContext();
  const register = async ({ name, email, password }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/register`, {
        name,
        email,
        password,
      });

      const data = response?.data;

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

  return { register };
};

export default useRegister;
