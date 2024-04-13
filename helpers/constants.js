const apiURL = "http://192.168.101.10:4000";
const socketURL = "http://192.168.101.10:8000";

const ERROR_MESSAGES = {
  REQUIRED: "This field is required.",
  NAME_INVALID: "Not a Valid Name.",
  INTERNAL_SERVER_ERROR: "Internal server error. Try again later.",
};

const REGEX = {
  personalName: /^[a-z ,.'-]+$/i,
  email:
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
};

const userRadius = 20;

export { apiURL, REGEX, ERROR_MESSAGES, userRadius, socketURL };
