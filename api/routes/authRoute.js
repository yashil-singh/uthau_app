const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

const { pool } = require("../dbConfig");

// Function to send mail
const sendMail = async (email, subject, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  });

  const mailOptions = {
    from: "uthau.com",
    to: email,
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    return { err: false };
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:32 ~ error:", error);
    return { err: true };
  }
};

// Endpoint to login a user
router.post("/login", async (req, res) => {
  try {
    // Retrieve the body of the request
    const { email, password } = req.body;

    // Check if user exists
    const registeredUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (registeredUser.rowCount == 0) {
      return res.status(401).json({ message: "Invalid email. Try again." });
    }

    const user = registeredUser.rows[0];

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Incorrect password. Try again." });
    }

    const user_id = user.user_id;
    const isVerified = user.isverified;

    const token = jwt.sign(
      { user_id: user_id, isVerified: isVerified },
      process.env.SECRET_KEY
    );

    return res.status(201).json({
      message: "Logged in.",
      isVerified: isVerified,
      token: token,
    });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:40 ~ error logging user:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to register a user
router.post("/register", async (req, res) => {
  try {
    // Retrieve the body of the request
    const { name, email, password } = req.body;

    if (!validator.isStrongPassword(password)) {
      return res.status(409).json({
        message:
          "Password is not strong enough. Must include atleast one uppercase and lowercase letter, number, and special character",
      });
    }

    // Check if user is already registered
    const isRegistered = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (isRegistered.rowCount != 0) {
      return res.status(401).json({ message: "Email already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Insert the user details to the database
    const result = await pool.query(
      `INSERT INTO users (name, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, hashedPassword, verificationToken]
    );

    const user = result.rows[0];
    const user_id = user.user_id;
    const fName = name.split(" ")[0];

    // Call function to send verification mail
    sendMail(
      email,
      "Email Verification",
      `Hi ${fName},\nYou are a step closer to starting your fitness journey. 
      Please click the following link to verify your email: ${process.env.API_URI}/verify/${user_id}/${verificationToken}\nThank you,\nUthau Team`
    );

    const token = jwt.sign({ user_id: user_id }, process.env.SECRET_KEY);

    return res
      .status(201)
      .json({ message: "Registration successful.", token: token });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:69 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/store-about/:email", async (req, res) => {
  try {
    const { age, gender, height, weight } = req.body;
    console.log(req.body);
    const { email } = req.params;
    console.log("🚀 ~ file: authRoute.js:150 ~ email:", email);

    if (!age || !gender || !height || !weight) {
      return res.status(401).json({ message: "All the fields are required" });
    }

    const roundedWeight = Math.abs(Number(weight).toFixed(2));
    const roundedHeight = Math.abs(Number(height).toFixed(2));

    console.log(age, gender, roundedHeight, roundedWeight, email);

    // Insert the user details to the database
    const result = await pool.query(
      `UPDATE users SET age = $1, gender = $2, height = $3, weight = $4 WHERE  email = $5 RETURNING *`,
      [age, gender, roundedHeight, roundedWeight, email]
    );

    console.log(result.rows);

    return res
      .status(200)
      .json({ message: "User details stored successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:157 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to verify a user with their email
router.post("/verify/:id/:token", async (req, res) => {
  try {
    // Retrieve values from params
    const { user_id, verificationToken } = req.params;

    // Search user with email and token
    const result = await pool.query(
      `SELECT * FROM users WHERE user_id = $1 AND verification_token = $2`,
      [user_id, verificationToken]
    );

    if (result.rowCount == 0) {
      return res.status(401).json({ message: "User not found." });
    }

    // Update the verification status of the user
    await pool.query(
      `UPDATE users SET isVerified = true WHERE user_id = $1 AND verification_token = $2`,
      [user_id, verificationToken]
    );

    return res.status(201).json({ message: "Email verified successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:144 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(401).json({ message: "Invalid request." });
  }

  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    id,
  ]);

  if (result.rowCount == 0) {
    return res.status(401).json({ message: "User not found." });
  }

  const user = result.rows[0];
  const fullName = user.name;
  const fName = fullName.split(" ")[0];

  const verificationToken = crypto.randomBytes(20).toString("hex");

  try {
    await pool.query(
      "UPDATE users SET verification_token = $1 WHERE email = $2",
      [verificationToken, email]
    );
    sendMail(
      email,
      "Email Verification",
      `Hi ${fName},\nYou are a step closer to starting your fitness journey. 
      Please click the following link to verify your email: ${process.env.API_URI}/verify/${user_id}/${verificationToken}\nThank you,\nUthau Team`
    );

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:257 ~ error:", error);
    throw error;
  }
});

// Endpoint for forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (result.rowCount == 0) {
      return res.status(404).json({ message: "Invalid email. Try again." });
    }

    const user = result.rows[0];

    const user_id = user.user_id;

    // Generate random six digit code
    const reset_code = crypto.randomInt(100000, 1000000);

    // Update the user's reset code in the database
    await pool.query(`UPDATE users SET reset_code = $1 WHERE email = $2`, [
      reset_code,
      email,
    ]);

    const sent = sendMail(
      email,
      "Reset Password",
      `Hi ${user.name},\nA request was made to reset your password. Here is the recovery code: ${reset_code}\nIf you did not initiate this request, please ignore this mail.\nThank you,\nUthau Team`
    );

    if (sent.err) {
      return res
        .status(500)
        .json({ message: "Error sending mail. Try again later." });
    }

    return res
      .status(201)
      .json({ id: user_id, message: "Reset code sent successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:176 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/resend-code", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(401).json({ message: "Invalid request." });
  }

  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    id,
  ]);

  if (result.rowCount == 0) {
    return res.status(401).json({ message: "User not found." });
  }

  const user = result.rows[0];
  const email = user.email;
  const fullName = user.name;
  const fName = fullName.split(" ")[0];

  // Generate random six digit code
  const reset_code = crypto.randomInt(100000, 1000000);

  try {
    await pool.query("UPDATE users SET reset_code = $1 WHERE email = $2", [
      reset_code,
      email,
    ]);
    const body = `Hi ${fName},\nA request has been recceived to reset your password. Following is the 6-digit code : ${reset_code}\nIf you did not initiate this request, you can ignore this mail.\nThank you,\nUthau Team`;
    sendMail(email, "Reset Password", body);

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:257 ~ error:", error);
    throw error;
  }
});

// Endpoint to check reset code
router.post("/check-reset-code/:id", async (req, res) => {
  try {
    const reset_code = req.body.resetCode;

    const user_id = req.params.id;

    const validCode = await pool.query(
      `SELECT * FROM users WHERE user_id = $1 AND reset_code = $2`,
      [user_id, reset_code]
    );

    if (validCode.rowCount == 0) {
      return res
        .status(401)
        .json({ message: "Invalid reset code. Try again." });
    }

    return res.status(201).json({ message: "Reset code matches." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:245 ~ error:", error);

    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to reset password
router.post("/reset-password/:id/:code", async (req, res) => {
  try {
    const { password } = req.body;
    const user_id = req.params.id;
    const reset_code = req.params.code;

    if (!validator.isStrongPassword(password)) {
      return res.status(401).json({
        message: "Password is not strong enough.",
      });
    }

    const result = await pool.query(
      `SELECT * FROM users WHERE user_id = $1 AND reset_code = $2`,
      [user_id, reset_code]
    );

    if (result.rowCount == 0) {
      return res.status(401).json({ message: "Invalid reset code." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(`UPDATE users SET password = $1 WHERE user_id = $2`, [
      hashedPassword,
      user_id,
    ]);

    return res.status(201).json({ message: "Password updated sucessfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:230 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to change password
router.post("/change-password", async (req, res) => {
  try {
    const { user_id, oldPassword, newPassword } = req.body;

    const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [
      user_id,
    ]);

    if (result.rowCount == 0) {
      return res.status(401).json({ message: "User not found." });
    }

    const user = result.rows[0];
    const oldHashedPassword = user.password;
    // Check if the password matches
    const correctPassword = await bcrypt.compare(
      oldPassword,
      oldHashedPassword
    );

    if (!correctPassword) {
      return res
        .status(401)
        .json({ message: "Password incorrect. Try again." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHasheedPassword = await bcrypt.hash(newPassword, salt);

    // Change the password in the database
    await pool.query(`UPDATE users set password = $1 WHERE user_id = $`, [
      newHasheedPassword,
      user_id,
    ]);

    return res.status(201).json({ message: "Password changed successfully." });
  } catch (error) {
    console.log("🚀 ~ file: authRoute.js:290 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error. Try again later." });
  }
});

module.exports = router;
