import axios from "axios";
import { apiURL } from "../helpers/constants";

const useRecipes = () => {
  const searchRecipe = async ({ searchQuery }) => {
    try {
      const response = await axios.get(
        `${apiURL}/recipe/search/${searchQuery}`
      );

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ useRecipes.js searchRecipe error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getRecipeMeal = async ({ meal }) => {
    try {
      const response = await axios.get(`${apiURL}/recipe/getMeal/${meal}`);

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ useRecipes.js error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const saveRecipe = async ({
    user_id,
    recipe_id,
    recipe_name,
    ingredients,
    servings,
    cooking_time,
    tags,
    calories,
    carbs,
    protein,
    fat,
    instruction_link,
    img_url,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/recipe/save`, {
        user_id,
        recipe_id,
        recipe_name,
        ingredients,
        servings,
        cooking_time,
        tags,
        calories,
        carbs,
        protein,
        fat,
        instruction_link,
        img_url,
      });

      return {
        success: true,
        message: response?.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getSavedRecipes = async (user_id) => {
    try {
      const response = await axios.get(
        `${apiURL}/diary/recipe/get-saved/${user_id}`
      );

      return {
        success: true,
        data: response?.data.data,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const removeSavedRecipe = async ({ user_id, recipe_id }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/recipe/remove`, {
        user_id,
        recipe_id,
      });

      return {
        success: true,
        message: response?.data.message,
        status: response?.status,
      };
    } catch (error) {
      console.log("🚀 ~ useRecipe.js error:", error.response?.data.message);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  return {
    searchRecipe,
    getRecipeMeal,
    saveRecipe,
    getSavedRecipes,
    removeSavedRecipe,
  };
};

export default useRecipes;
