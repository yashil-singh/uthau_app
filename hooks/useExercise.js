import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";

const useExercise = () => {
  const { user } = useAuthContext();

  // // Setting up headers to send with the request
  // axios.interceptors.request.use((config) => {
  //   const token = user?.token || null;

  //   if (token) {
  //     config.headers["x-access-token"] = token;
  //   }

  //   return config;
  // });

  // To search for an exercise using user's search query
  const searchExercise = async ({ searchQuery }) => {
    try {
      const response = await axios.get(
        `${apiURL}/exercise/search/${searchQuery}`
      );

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  // To get exercises according to body part
  const getBodyPart = async ({ bodyPart }) => {
    try {
      const response = await axios.get(
        `${apiURL}/exercise/body-part/${bodyPart}`
      );

      const data = response.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  // To save an exercise to user's diary
  const saveExercise = async ({
    exercise_id,
    exercise_name,
    target,
    secondaryMuscles,
    instructions,
    equipment,
    gifUrl,
    bodyPart,
    user_id,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/exercise/save`, {
        exercise_id,
        exercise_name,
        target,
        secondaryMuscles,
        instructions,
        equipment,
        gifUrl,
        bodyPart,
        user_id,
      });

      const data = response?.data;

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  // To remove saved exercise from user's diary
  const removeSavedExercise = async ({ user_id, exercise_id }) => {
    try {
      const response = await axios.post(`${apiURL}/diary/exercise/remove`, {
        user_id,
        exercise_id,
      });
      return {
        success: true,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  // To fetch list of exercises that the user has saved in their diary
  const getSavedExercises = async (user_id) => {
    try {
      const response = await axios.get(
        `${apiURL}/diary/exercise/get-saved/${user_id}`
      );

      const data = response?.data;

      return {
        success: true,
        data: data.data,
        status: response?.status,
        message: response?.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  return {
    searchExercise,
    getBodyPart,
    saveExercise,
    getSavedExercises,
    removeSavedExercise,
  };
};

export default useExercise;
