const express = require("express");
const router = express.Router();
const axios = require("axios");

const strictVerifyToken = require("../helpers/strictVerification");
const { pool } = require("../dbConfig");

router.get("/search/:query", strictVerifyToken, async (req, res) => {
  try {
    const { query } = req.params;
    console.log("🚀 ~ query:", query);

    const options = {
      method: "GET",
      url: process.env.EDAMAN_API_URL,
      params: {
        ingr: `${query}`,
        "nutrition-type": "logging",
        "category[0]": "generic-foods",
        "health[0]": "alcohol-free",
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "edamam-food-and-grocery-database.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log("🚀 ~ response:", response.data);

      return res.status(200).json(response.data);
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error. Try again later." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error. Try again later." });
  }
});

router.post("/log-food", strictVerifyToken, async (req, res) => {
  const {
    user_id,
    date,
    foodId,
    label,
    calories,
    carbs,
    fat,
    protein,
    quantity,
    selectedMeal,
  } = req.body;

  if (user_id == null || date == null) {
    return res.status(400).json({ message: "Invalid request." });
  }

  try {
    var food_diary_id;

    const findDiary = await pool.query(
      `SELECT food_diary_id FROM food_diary WHERE user_id = $1 AND date = $2`,
      [user_id, date]
    );

    if (findDiary.rows[0]) {
      food_diary_id = findDiary.rows[0].food_diary_id;
    } else {
      const addFoodDiaryResult = await pool.query(
        `INSERT INTO food_diary (date, user_id) VALUES ($1, $2) RETURNING food_diary_id`,
        [date, user_id]
      );

      food_diary_id = addFoodDiaryResult.rows[0].food_diary_id;
    }

    const result = await pool.query(
      `
      INSERT INTO logged_food 
        (food_diary_id, food_id, food_name, calories, carbs, fat, protein, quantity, meal_type)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        food_diary_id,
        foodId,
        label,
        calories,
        carbs,
        fat,
        protein,
        quantity,
        selectedMeal,
      ]
    );

    return res.status(200).json({ message: "Food added." });
  } catch (error) {
    console.log("🚀 ~ error: line 64 diaryRoute.js -> ", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/get-food-log", strictVerifyToken, async (req, res) => {
  try {
    const { user_id, date } = req.body;

    const result = await pool.query(
      `
      SELECT 
        fd.food_diary_id,
        fd.date as f_date,
        fd.user_id,
        lf.food_name,
        lf.quantity,
        lf.calories,
        lf.meal_type,
        lf.protein,
        lf.fat,
        lf.carbs
      FROM 
        food_diary fd
      JOIN
        logged_food lf ON fd.food_diary_id = lf.food_diary_id
      WHERE
        fd.user_id = $1
      AND
        fd.date = $2;
    `,
      [user_id, date]
    );

    const mealTotals = await pool.query(
      `SELECT
            lf.meal_type,
            SUM(lf.calories) AS total_calories
        FROM
            food_diary fd
        JOIN
            logged_food lf ON fd.food_diary_id = lf.food_diary_id
        WHERE
            fd.user_id = $1
        AND
            fd.date = $2
        GROUP BY
            lf.meal_type;
      `,
      [user_id, date]
    );

    return res
      .status(200)
      .json({ result: result.rows, mealTotals: mealTotals.rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error. Try again later." });
  }
});

module.exports = router;
