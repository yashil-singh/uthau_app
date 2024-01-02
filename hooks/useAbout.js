import axios from "axios";
import { apiURL } from "../helpers/constants";

const useAbout = () => {
  const storeAboutInfo = async ({ email, age, gender, height, weight }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/store-about/${email}`, {
        age,
        gender,
        height,
        weight,
      });

      const data = response?.data;
      console.log("🚀 ~ file: useAbout.js:15 ~ data:", data);

      return {
        success: true,
      };
    } catch (error) {
      console.log("🚀 ~ file: useAbout.js:16 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  return { storeAboutInfo };
};

export default useAbout;
