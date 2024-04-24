import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";

const useFood = () => {
  const { user } = useAuthContext();

  // Setting up headers to send with the request
  // axios.interceptors.request.use((config) => {
  //   const token = user?.token || null;

  //   if (token) {
  //     config.headers["x-access-token"] = token;
  //   }

  //   return config;
  // });

  // To fetch the list of logged foods by the user
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

  // To search for a food using the search query provided by the user
  const searchFood = async ({ searchQuery }) => {
    try {
      const response = await axios.get(`${apiURL}/diary/search/${searchQuery}`);
      const data = response?.data;

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

  // To log the food selected by the user
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
      await axios.post(`${apiURL}/diary/log-food`, {
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

export default useFood;
