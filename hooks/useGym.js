import { View, Text } from "react-native";
import React from "react";
import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";
import * as SecureStore from "expo-secure-store";

const useGym = () => {
  const { dispatch } = useAuthContext();
  const requestMembership = async ({ email, code }) => {
    try {
      const response = await axios.post(
        `${apiURL}/gym/member/convert/request`,
        {
          email,
          code,
        }
      );
      const data = response?.data;

      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        await SecureStore.setItemAsync("authToken", JSON.stringify(data));
      }

      dispatch({ type: "LOGIN", payload: data });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);

      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getMemberById = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/gym/member/${user_id}`);

      const data = response?.data;

      return {
        success: true,
        member: data,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);

      if (error.response?.status === 404) {
        return {
          success: true,
          member: null,
        };
      }
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getReportYears = async () => {
    try {
      const reponse = await axios.get(`${apiURL}/gym/member/report/get-year`);

      const data = reponse?.data;

      return {
        success: true,
        years: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getReport = async ({ member_id, month, year }) => {
    try {
      const response = await axios.get(
        `${apiURL}/gym/member/report/${member_id}/${month}/${year}`
      );
      const data = response?.data;

      return {
        success: true,
        report: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getCompetitions = async () => {
    try {
      const resposne = await axios.get(`${apiURL}/gym/announcement`);

      const data = resposne?.data;

      return {
        success: true,
        announcements: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getPlans = async () => {
    try {
      const response = await axios.get(`${apiURL}/gym/plan`);

      const data = response?.data;

      return {
        success: true,
        plans: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const onActivateMembership = async ({ code, user_id }) => {
    try {
      const resposne = await axios.post(`${apiURL}/gym/member/activate`, {
        code,
        user_id,
      });

      const data = resposne.data;
      const token = data.token;

      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        await SecureStore.setItemAsync("authToken", JSON.stringify(data));
      }

      dispatch({ type: "LOGOUT" });

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

  const getTrainerAssignments = async ({ user_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/gym/trainer/students/${user_id}`
      );

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getMetrics = async () => {
    try {
      const response = await axios.get(`${apiURL}/gym/metrics`);

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const onEvaluateMember = async ({ trainer_id, member_id, grades, note }) => {
    try {
      const response = await axios.post(`${apiURL}/gym/trainer/evaluate`, {
        trainer_id,
        member_id,
        grades,
        note,
      });

      const data = response.data;

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

  const getExerciseRecommendations = async ({ member_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/gym/exercise/recommendations/${member_id}`
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
        message: error.response?.data.message,
      };
    }
  };

  const getRecipeRecommendations = async ({ member_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/gym/meal/recommendations/${member_id}`
      );

      const data = response.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const generateExerciseRecommendations = async ({ member_id }) => {
    try {
      const response = await axios.post(`${apiURL}/gym/exercise/recommend`, {
        member_id,
      });

      const data = response.data;

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

  const generateRecipeRecommendations = async ({ member_id }) => {
    try {
      const response = await axios.post(`${apiURL}/gym/meal/recommend`, {
        member_id,
      });

      const data = response.data;

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

  return {
    requestMembership,
    getMemberById,
    getReportYears,
    getReport,
    getCompetitions,
    getPlans,
    onActivateMembership,
    getTrainerAssignments,
    getMetrics,
    onEvaluateMember,
    getExerciseRecommendations,
    getRecipeRecommendations,
    generateExerciseRecommendations,
    generateRecipeRecommendations,
  };
};

export default useGym;
