const formatWord = (str) => {
  if (str == null) return null;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default formatWord;
