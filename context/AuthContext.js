import { createContext, useReducer, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": {
      try {
        const payloadString = JSON.stringify(action.payload);
        const userObject = JSON.parse(payloadString);

        return { user: userObject };
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return state; // Return the current state in case of an error
      }
    }
    case "LOGOUT": {
      return { user: null };
    }
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  // Check for authToken in SecureStore
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJson = await SecureStore.getItemAsync("authToken");

        if (userJson) {
          const user = JSON.parse(userJson);
          // If authToken exists, dispatch LOGIN action
          dispatch({ type: "LOGIN", payload: user });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []); // Empty dependency array to run the effect only once

  console.log("AUTH STATE: ", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
