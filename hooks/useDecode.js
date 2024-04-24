import axios from "axios";
import { apiURL } from "../helpers/constants";
import { useAuthContext } from "./useAuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";

const useDecode = () => {
  const { user, dispatch } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    axios.interceptors.request.use((config) => {
      const token = user?.token || null;

      if (token) {
        config.headers["x-access-token"] = token;
      }

      return config;
    });

    if (!user) {
      axios.interceptors.request.clear();
    }
  }, [user]);

  const getDecodedToken = async () => {
    try {
      const response = await axios.get(`${apiURL}/auth/decode`);

      const data = response?.data;

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data.message,
      };
    }
  };

  return {
    getDecodedToken,
  };
};

export default useDecode;
