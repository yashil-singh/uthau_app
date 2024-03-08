import axios from "axios";
import { apiURL } from "../helpers/constants";

const useCheckRestCode = () => {
  const checkResetCode = async ({ id, resetCode }) => {
    try {
      const response = await axios.post(
        `${apiURL}/auth/check-reset-code/${id}`,
        { resetCode }
      );

      return {
        success: true,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ file: useCheckRestCode.js:18 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };
  return { checkResetCode };
};

export default useCheckRestCode;
