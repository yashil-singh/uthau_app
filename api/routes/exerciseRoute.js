const express = require("express");
const router = express.Router();
const axios = require("axios");

const strictVerifyToken = require("../helpers/strictVerification");
const { pool } = require("../dbConfig");

// To get all the exercises
router.get("/", strictVerifyToken, async (req, res) => {
  const options = {
    method: "GET",
    url: "https://exercisedb.p.rapidapi.com/exercises",
    params: {
      limit: "2500",
      offset: "15",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.RAPIDAPI_EXERCISE_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
});

// To get an exercise searched by the user
router.get("/search/:searchQuery", strictVerifyToken, async (req, res) => {
  const { searchQuery } = req.params;

  const options = {
    method: "GET",
    url: `https://exercisedb.p.rapidapi.com/exercises/name/${searchQuery}`,
    params: {
      limit: "2500",
      offset: "15",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.RAPIDAPI_EXERCISE_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    const data = response?.data;

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// To get exercises according to body part
router.get("/body-part/:bodyPart", strictVerifyToken, async (req, res) => {
  const { bodyPart } = req.params;

  if (!bodyPart) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const options = {
    method: "GET",
    url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
    params: {
      limit: "2500",
      offset: "15",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.RAPIDAPI_EXERCISE_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    const data = response?.data;

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
