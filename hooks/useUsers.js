import axios from "axios";
import React from "react";
import { apiURL } from "../helpers/constants";

export const useUsers = () => {
  const getUserDetail = async ({ user_id }) => {
    try {
      const response = await axios.get(
        `${apiURL}/users/get?user_id=${user_id}`,
        {
          user_id,
        }
      );

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

  return {
    getUserDetail,
    updateUserLocation,
    getAllFriends,
    getNearByUsers,
    getUserRequestReceived,
    getUserRequestSent,
    sendRequest,
    acceptRequest,
  };
};
