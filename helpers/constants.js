
const apiURL = "http://192.168.101.2:4000";

const ERROR_MESSAGES = {
  REQUIRED: "This field is required.",
  NAME_INVALID: "Not a Valid Name.",
};

const REGEX = {
  personalName: /^[a-z ,.'-]+$/i,
  email:
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
};

export { apiURL, REGEX, ERROR_MESSAGES };
