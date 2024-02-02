import { decode as atob } from "base-64";

function decodeToken(token) {
  try {
    const accessToken = token?.token;
    const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export default decodeToken;
