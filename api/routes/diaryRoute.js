const express = require("express");
const router = express.Router();
const axios = require("axios");

const strictVerifyToken = require("../helpers/strictVerification");
const { pool } = require("../dbConfig");

// To get a list of food searched by the user
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

// To log the food selected by the user
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

// To get the foods logged by the user
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

// To save exercise to diary
router.post("/exercise/save", strictVerifyToken, async (req, res) => {
  try {
    const {
      exercise_id,
      exercise_name,
      target,
      secondaryMuscles,
      instructions,
      equipment,
      gifUrl,
      bodyPart,
      user_id,
    } = req.body;

    const parsedExerciseId = parseInt(exercise_id);

    const checkSaved = await pool.query(
      `SELECT user_id, exercise_id FROM saved_exercises WHERE user_id = $1 AND exercise_id = $2`,
      [user_id, parsedExerciseId]
    );

    if (checkSaved.rowCount > 0) {
      return res.status(400).json({ message: "Exercise is already saved." });
    }

    const result = await pool.query(
      `INSERT INTO saved_exercises (
      exercise_id,
      exercise_name,
      target,
      secondary_muscles,
      instructions,
      equipment,
      gif_url,
      body_part,
      user_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        parsedExerciseId,
        exercise_name,
        target,
        secondaryMuscles,
        instructions,
        equipment,
        gifUrl,
        bodyPart,
        user_id,
      ]
    );

    return res.status(200).json({ message: "Exercise saved successfully." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// To return list of saved exercises
router.get(
  "/exercise/get-saved/:user_id",
  strictVerifyToken,
  async (req, res) => {
    const { user_id } = req.params;

    try {
      if (!user_id) {
        return res.status(400).json({ message: "Invalid request." });
      }
      const result = await pool.query(
        `SELECT * FROM saved_exercises WHERE user_id = $1`,
        [user_id]
      );

      if (result.rowCount <= 0) {
        return res.status(202).json({
          message: "No saved exercises found in your diary.",
        });
      }

      return res.status(200).json({ data: result.rows });
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error. Try again later." });
    }
  }
);

// To remove a saved exercise from the user's diary
router.post("/exercise/remove", strictVerifyToken, async (req, res) => {
  try {
    const { user_id, exercise_id } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    if (!user_id || !exercise_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const check = await pool.query(
      "SELECT * FROM saved_exercises WHERE user_id = $1 AND exercise_id = $2",
      [user_id, exercise_id]
    );

    if (check.rowCount <= 0) {
      return res.status(404).json({ message: "Exercise not found in diary." });
    }

    await pool.query(
      "DELETE FROM saved_exercises WHERE user_id = $1 AND exercise_id = $2",
      [user_id, exercise_id]
    );

    return res
      .status(200)
      .json({ message: "Exercise removed from diary successfully." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// To return list of saved recipes
router.get(
  "/recipe/get-saved/:user_id",
  strictVerifyToken,
  async (req, res) => {
    try {
      const { user_id } = req.params;
      console.log("🚀 ~ req.params:", req.params);

      if (!user_id || user_id == undefined) {
        return res.status(400).json({ message: "Invalid request." });
      }
      const result = await pool.query(
        `SELECT * FROM saved_recipes WHERE user_id = $1`,
        [user_id]
      );

      if (result.rowCount <= 0) {
        return res.status(202).json({
          message: "No saved recipes found in your diary.",
        });
      }

      return res.status(200).json({ data: result.rows });
    } catch (error) {
      console.log("🚀 ~ getSavedRecipes error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error. Try again later." });
    }
  }
);

// To save recipe to diary
router.post("/recipe/save", strictVerifyToken, async (req, res) => {
  try {
    const {
      user_id,
      recipe_id,
      recipe_name,
      ingredients,
      servings,
      cooking_time,
      tags,
      calories,
      carbs,
      protein,
      fat,
      instruction_link,
      img_url,
    } = req.body;

    if (!user_id || !recipe_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const check = await pool.query(
      `SELECT * FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2`,
      [user_id, recipe_id]
    );

    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Recipe is already saved." });
    }

    const tag_labels = tags.map((item) => item.label);

    await pool.query(
      `INSERT INTO saved_recipes 
      (user_id, recipe_id, recipe_name, ingredients, servings, cook_time, tags, calories, carbs, protein, fat, instruction_link, img_url) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        user_id,
        recipe_id,
        recipe_name,
        ingredients,
        servings,
        cooking_time,
        tag_labels,
        calories,
        carbs,
        protein,
        fat,
        instruction_link,
        img_url,
      ]
    );

    return res.status(200).json({ message: "Recipe saved successfully." });
  } catch (error) {
    console.log("🚀 ~ diaryRoute.js save exercise error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// To remove a saved recipe from the user's diary
router.post("/recipe/remove", strictVerifyToken, async (req, res) => {
  const { user_id, recipe_id } = req.body;

  try {
    if (!user_id || !recipe_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const check = await pool.query(
      "SELECT * FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2",
      [user_id, recipe_id]
    );

    if (check.rowCount < 0) {
      return res.status(404).json({ message: "Recipe not found in diary." });
    }

    await pool.query(
      "DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2",
      [user_id, recipe_id]
    );

    return res
      .status(200)
      .json({ message: "Recipe removed from diary successfully." });
  } catch (error) {
    console.log("🚀 ~ diaryRoute error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
