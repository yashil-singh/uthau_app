const express = require("express");
const router = express.Router();
const axios = require("axios");

const { pool } = require("../dbConfig");

router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const apiKey = process.env.FOOD_API_KEY;
    const sApiKey = process.env.S_FOOD_API_KEY;
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&dataType=Foundation&pageSize=25&sortBy=fdcId&requireAllWords=true&sortOrder=asc&api_key=${apiKey}`;
    const urlSpoonacular = `https://api.spoonacular.com/food/ingredients/search?query=${query}&apiKey=${sApiKey}`;
    const response = await axios.get(urlSpoonacular);
    const data = response.data;

    // const extractedData = data.foods.map((food) => ({
    //   description: food.description,
    //   servingSize: {
    //     unit: food.servingSizeUnit,
    //     value: food.servingSize,
    //   },
    //   nutritionValues: food.foodNutrients.map((nutrient) => ({
    //     name: nutrient.nutrientName,
    //     unit: nutrient.unitName,
    //     value: nutrient.value,
    //   })),
    // }));
    // const descriptions = response.data.foods.map((food) => food.description);
    // const servingSize = response.data.foods.map((food) => food.servingSize);
    // console.log("🚀 ~ file: diaryRoute.js:13 ~ data:", servingSize);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error. Try again later." });
  }
});

module.exports = router;
