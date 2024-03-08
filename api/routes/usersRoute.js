const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const { pool } = require("../dbConfig");

router.get("/get-all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    const users = result.rows;
    return res.status(200).json({ data: users });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/add/trainer", async (req, res) => {
  try {
    const { name, email, gender, age, shift, startTime, endTime } = req.body;
    console.log(req.body);
    if (
      !name ||
      !email ||
      !gender ||
      !age ||
      !shift ||
      !startTime ||
      !endTime
    ) {
      return res
        .status(400)
        .json({ message: "Invalid request. All fields are required." });
    }

    if (age < 15) {
      return res.status(400).json({ message: "Invalid age. Try again." });
    }

    const password = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = "trainer";
    const isVerified = true;

    const check = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const result = await pool.query(
      "INSERT INTO users(name, email, gender, age, password, role, isVerified) VALUES ($1, $2, $3, $4, $5, $6, $7)  RETURNING *",
      [name, email, gender, age, hashedPassword, role, isVerified]
    );

    const user = result.rows[0];

    const user_id = user.user_id;

    await pool.query(
      "INSERT INTO trainers(user_id, start_time, end_time, shift) VALUES ($1, $2, $3, $4)",
      [user_id, startTime, endTime, shift]
    );

    return res
      .status(200)
      .json({ message: "Trainer profile created successfully." });
  } catch (error) {
    console.log("🚀 ~ add trainer error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
