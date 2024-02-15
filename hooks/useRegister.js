import axios from "axios";
import { apiURL } from "../helpers/constants";

const useRegister = () => {
  const register = async ({
    name,
    email,
    password,
    age,
    gender,
    height,
    weight,
    activityLevel,
    weightGoal,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/auth/register`, {
        name,
        email,
        password,
        age,
        gender,
        height,
        weight,
        activityLevel,
        weightGoal,
      });

      const data = response?.data;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data.message,
      };
    }
  };

  return { register };
};

export default useRegister;
