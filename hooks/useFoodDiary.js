import axios from "axios";
import { apiURL } from "../helpers/constants";

const useFoodDiary = () => {
  const searchFood = async ({ keyword }) => {
    try {
      const response = await axios.get(`${apiURL}/diary/search/${keyword}`);
      const data = response?.data;
      console.log("🚀 ~ file: useFoodDiary.js:9 ~ response:", response);

      return {
        success: true,
        data: data.results,
      };
    } catch (error) {
      console.log("🚀 ~ file: useFoodDiary.js:9 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  return { searchFood };
};

export default useFoodDiary;
