import { View, Text } from "react-native";
import React from "react";
import axios from "axios";
import { apiURL } from "../helpers/constants";

const usePay = () => {
  const onInitializePay = async ({ amount, order_name, user_id }) => {
    try {
      const response = await axios.post(`${apiURL}/payment/initialize`, {
        user_id,
        order_name,
        amount,
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

  return { onInitializePay };
};

export default usePay;
