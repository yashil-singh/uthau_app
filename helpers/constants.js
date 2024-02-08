const apiURL = "http://10.50.3.145:4000";
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
