import axios from "axios";
import { apiURL } from "../helpers/constants";

const useForgotPassword = () => {
  const forgotPassword = async ({ email }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/forgot-password`, {
        email,
      });
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
  return { forgotPassword };
};

export default useForgotPassword;
