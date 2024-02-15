const express = require("express");
const router = express.Router();
const axios = require("axios");

const strictVerifyToken = require("../helpers/strictVerification");
const { pool } = require("../dbConfig");

// To get results based on user's search query
router.get("/search/:searchQuery", strictVerifyToken, async (req, res) => {
  const { searchQuery } = req.params;

  if (!searchQuery) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const options = {
    method: "GET",
    url: "https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2",
    params: {
      type: "public",
      "field[0]": "uri",
      q: `${searchQuery}`,
      beta: "true",
      random: "false",
    },
    headers: {
      "Accept-Language": "en",
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.RAPIDAPI_RECIPE_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    const data = response?.data;

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ recipeRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// To get results based on selected diet label
router.get("/getMeal/:meal", strictVerifyToken, async (req, res) => {
  const { meal } = req.params;

  if (!meal) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const options = {
    method: "GET",
    url: "https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2",
    params: {
      type: "public",
      "field[0]": "uri",
      beta: "true",
      random: "false",
      health: "alcohol-free",
      mealType: `${meal}`,
    },
    headers: {
      "Accept-Language": "en",
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.RAPIDAPI_RECIPE_HOST,
    },
  };

  try {
    const response = await axios.request(options);

    const data = response?.data;

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ recipeRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
