import { createContext, useReducer } from "react";

const RegisterContext = createContext();

export const registerReducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: { ...state.data, ...action.payload } };
    default:
      return state;
  }
};

export const RegisterContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(registerReducer, {
    data: null,
  });

  return (
    <RegisterContext.Provider value={{ ...state, dispatch }}>
      {children}
    </RegisterContext.Provider>
  );
};

export default RegisterContext;
