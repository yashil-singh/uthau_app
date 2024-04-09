import { View, Text } from "react-native";
import React from "react";
import axios from "axios";
import { apiURL } from "../helpers/constants";

const useGym = () => {
  const getMemberCode = async ({ user_id }) => {
    try {
      const response = await axios.get(`${apiURL}/gym/member/code/${user_id}`);
      const code = response?.data;

      return {
        success: true,
        code: code,
      };
    } catch (error) {
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

  return {
    getMemberCode,
    getMemberById,
    getReportYears,
    getReport,
    getCompetitions,
  };
};

export default useGym;
