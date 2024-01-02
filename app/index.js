import { Redirect } from "expo-router";
import { useAuthContext } from "../hooks/useAuthContext";

const Index = () => {
  const { user } = useAuthContext();
  return <Redirect href={user ? "/home" : "/login"} />;
};

export default Index;
