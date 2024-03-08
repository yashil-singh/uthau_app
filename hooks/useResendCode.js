import axios from "axios";
import { apiURL } from "../helpers/constants";

const useResendCode = () => {
  const resendCode = async ({ id }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/resend-code/`, { id });
      return {
        success: true,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ file: useResendCode.js:18 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };
  return { resendCode };
};

export default useResendCode;
