import axios from "axios";
import React from "react";
import { apiURL } from "../helpers/constants";
import * as SecureStore from "expo-secure-store";
import { useAuthContext } from "./useAuthContext";

export const useUsers = () => {
  const { dispatch } = useAuthContext();

  const getUserDetail = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/users/get/${user_id}`);

      const data = response?.data;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js getUserDetail error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const updateUserProfile = async ({
    user_id,
    name,
    dob,
    gender,
    weight,
    height,
    calorie_burn,
    calorie_intake,
    image,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/users/update`, {
        user_id,
        name,
        dob,
        gender,
        weight,
        height,
        calorie_burn,
        calorie_intake,
        image,
      });

      const data = response?.data;
      console.log("🚀 ~ data:", data);

      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        await SecureStore.setItemAsync("authToken", JSON.stringify(data));
      }

      dispatch({ type: "LOGIN", payload: data });

      return {
        success: true,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);

      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const updateUserLocation = async ({ user_id, lat, lng }) => {
    try {
      const response = await axios.post(`${apiURL}/users/update/location`, {
        user_id,
        lat,
        lng,
      });

      const data = response?.data;

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getAllFriends = async ({ user_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/users/friends/get-all?user_id=${user_id}`
      );

      const connections = response?.data;

      return {
        success: true,
        data: connections,
      };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getNearByUsers = async ({ lat, lng, radius, user_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/users/friends/get-nearby?lat=${lat}&lng=${lng}&radius=${radius}&user_id=${user_id}`
      );

      const data = response?.data;

      return {
        success: true,
        nearbyUsers: data,
      };
    } catch (error) {
      console.log(
        "🚀 ~ useUsers.js getNearbyUsers error:",
        error.response?.data.message
      );
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getUserRequests = async ({ user_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/users/friends/requests/${user_id}`
      );

      const data = response?.data;

      return {
        success: true,
        requests: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getUserRequestReceived = async ({ lat, lng, radius, user_id }) => {
    try {
      const reponse = await axios.get(
        `${apiURL}/users/friends/requests/received?lat=${lat}&lng=${lng}&radius=${radius}&user_id=${user_id}`
      );

      const data = reponse?.data;

      return {
        success: true,
        requests: data,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js getUserRequestReceived error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getUserRequestSent = async ({ user_id }) => {
    try {
      const reponse = await axios.get(
        `${apiURL}/users/friends/requests/sent?user_id=${user_id}`
      );

      const data = reponse?.data;

      return {
        success: true,
        requests: data,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js getUserRequestSent error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const sendRequest = async ({ sender_id, receiver_id }) => {
    try {
      const response = await axios.post(
        `${apiURL}/users/friends/requests/send`,
        {
          sender_id,
          receiver_id,
        }
      );

      if (response.status === 200) {
        const data = response?.data;

        return {
          success: true,
          message: data?.message,
        };
      }

      return {
        success: false,
        message: response?.data.message,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js sendRequest error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const removeRequest = async ({ sender_id, receiver_id }) => {
    try {
      const response = await axios.post(
        `${apiURL}/users/friends/requests/remove`,
        {
          sender_id,
          receiver_id,
        }
      );
      const data = response?.data;

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js sendRequest error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const acceptRequest = async ({ sender_id, receiver_id }) => {
    try {
      const response = await axios.post(
        `${apiURL}/users/friends/requests/accept`,
        {
          sender_id,
          receiver_id,
        }
      );

      const data = response?.data;

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log("🚀 ~ useUsers.js acceptRequest error:", error);
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const rejectRequest = async ({ sender_id, receiver_id }) => {
    try {
      const response = await axios.post(
        `${apiURL}/users/friends/requests/reject`,
        {
          sender_id,
          receiver_id,
        }
      );

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

  const removeFriend = async ({ sender_id, receiver_id }) => {
    try {
      const response = await axios.post(`${apiURL}/users/friends/remove`, {
        sender_id,
        receiver_id,
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

  const getPartners = async ({ id, id2 }) => {
    try {
      const response = await axios.get(`${apiURL}/users/friends/${id}/${id2}`);

      const data = response?.data;

      return {
        success: true,
        partners: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const getUserEntries = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/gym/entries/${user_id}`);

      const data = response?.data;

      return {
        success: true,
        entries: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const logWeight = async ({ user_id, weight, date }) => {
    try {
      const response = await axios.post(`${apiURL}/users/weight/log`, {
        user_id,
        weight,
        date,
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

  const getWeightLogs = async ({ user_id, range }) => {
    try {
      const response = await axios.get(
        `${apiURL}/users/weight/${user_id}/${range}`
      );

      return {
        success: true,
        logs: response?.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const logSteps = async ({ user_id, steps }) => {
    try {
      const response = await axios.post(`${apiURL}/users/steps/log`, {
        user_id,
        steps,
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

  const getStepLogs = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/users/steps/log/${user_id}`);

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

  const onArScan = async ({ user_id }) => {
    try {
      const response = await axios.post(`${apiURL}/users/ar/points`, {
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

  const getArPoints = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/users/ar/points/${user_id}`);

      const data = response?.data;

      return {
        success: true,
        totalPoints: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  return {
    getUserDetail,
    logWeight,
    updateUserProfile,
    updateUserLocation,
    getAllFriends,
    getNearByUsers,
    getUserRequestReceived,
    getUserRequestSent,
    sendRequest,
    acceptRequest,
    rejectRequest,
    getUserEntries,
    getWeightLogs,
    logSteps,
    getStepLogs,
    onArScan,
    getArPoints,
    removeRequest,
    getUserRequests,
    removeFriend,
    getPartners,
  };
};
