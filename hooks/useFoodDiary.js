import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";

const useFoodDiary = () => {
  const { user } = useAuthContext();

  axios.interceptors.request.use((config) => {
    const token = user?.token || null;

    if (token) {
      config.headers["x-access-token"] = token;
    }

    return config;
  });

  const getLoggedFood = async ({ user_id, date }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/get-food-log`, {
        user_id,
        date,
      });

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const searchFood = async ({ searchQuery }) => {
    console.log("🚀 ~ keyword:", searchQuery);

    try {
      const response = await axios.get(`${apiURL}/diary/search/${searchQuery}`);
      const data = response?.data;
      console.log("🚀 ~ data:", data);

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  const logFood = async ({
    user_id,
    date,
    foodId,
    label,
    calories,
    carbs,
    fat,
    protein,
    quantity,
    selectedMeal,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/log-food`, {
        user_id,
        date,
        foodId,
        label,
        calories,
        carbs,
        fat,
        protein,
        quantity,
        selectedMeal,
      });

      const data = response?.data;

      console.log(data);

      return {
        success: true,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  return { searchFood, getLoggedFood, logFood };
};

export default useFoodDiary;
