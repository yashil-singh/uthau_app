import { View, Text } from "react-native";
import React from "react";
import axios from "axios";
import { apiURL } from "../helpers/constants";
import * as SecureStore from "expo-secure-store";
import { useAuthContext } from "./useAuthContext";

const usePay = () => {
  const { dispatch } = useAuthContext();

  const onPayCompetitionEntry = async ({
    fitness_competition_id,
    user_id,
    amount,
    order_name,
  }) => {
    try {
      const response = await axios.post(`${apiURL}/payment/competition`, {
        fitness_competition_id,
        user_id,
        amount,
        order_name,
      });

      const data = response.data;

      return {
        success: true,
        order_id: data.order_id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const onPayMembership = async ({ plan_id, user_id }) => {
    try {
      const response = await axios.post(`${apiURL}/payment/membership`, {
        plan_id,
        user_id,
      });

      const data = response.data;
      console.log("🚀 ~ data:", data);

      return {
        success: true,
        order_id: data.order_id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const onInitializePay = async ({ order_id }) => {
    try {
      const response = await axios.post(`${apiURL}/payment/initialize`, {
        order_id,
      });
      const data = response?.data;
      return {
        success: true,
        uri: data.url,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  const onMemberShipPaymentSuccess = async ({ user_id, payment_id }) => {
    try {
      const response = await axios.post(
        `${apiURL}/gym/member/payment/convert`,
        {
          user_id,
          payment_id,
        }
      );

      const token = response?.data.token;

      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        await SecureStore.setItemAsync("authToken", JSON.stringify(token));
      }

      dispatch({ type: "LOGIN", payload: data });

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

  return {
    onInitializePay,
    onPayCompetitionEntry,
    onPayMembership,
    onMemberShipPaymentSuccess,
  };
};

export default usePay;
