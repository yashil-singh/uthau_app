import axios from "axios";
import { apiURL } from "../helpers/constants";

const useResetPassword = () => {
  const resetPassword = async ({ id, code, password }) => {
    try {
      const response = await axios.post(
        `${apiURL}/auth/reset-password/${id}/${code}`,
        {
          password,
        }
      );
      return {
        success: true,
        id: response?.data.id,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ file: useForgotPassword.js:9 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };
  return { resetPassword };
};

export default useResetPassword;
