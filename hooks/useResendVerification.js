import axios from "axios";
import { apiURL } from "../helpers/constants";

const useResendVerification = () => {
  const resendVerification = async ({ email }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/resend-verification`, {
        email,
      });
      return {
        success: true,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ file: useResendVerification.js:13 ~ error:", error);

      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };
  return { resendVerification };
};

export default useResendVerification;
