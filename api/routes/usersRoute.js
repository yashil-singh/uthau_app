const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pool } = require("../dbConfig");

function isValidShift(shift, startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}:00Z`);
  const end = new Date(`1970-01-01T${endTime}:00Z`);
  const timeDifferenceInMinutes = (end - start) / (1000 * 60);

  const isValidTimeDifference =
    timeDifferenceInMinutes >= 30 && timeDifferenceInMinutes <= 7 * 60;

  const isValidShiftSelection =
    (shift === "morning" &&
      start.getUTCHours() < 12 &&
      end.getUTCHours() <= 12) ||
    (shift === "night" && start.getUTCHours() >= 12 && end.getUTCHours() > 12);

  return isValidTimeDifference && isValidShiftSelection;
}

function degreeToRadius(deg) {
  return deg * (Math.PI / 180);
}

function calculateDistance(coord1, coord2) {
  const earthRadius = 6371;
  const dLat = degreeToRadius(coord2.latitude - coord1.latitude);

  const dLon = degreeToRadius(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreeToRadius(coord1.latitude)) *
      Math.cos(degreeToRadius(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = (earthRadius * c).toFixed(2);

  return distance;
}

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

router.get("/get-all", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, image, role, created_at, age, gender, height, weight, activity_level, calorie_intake, calorie_burn, weight_goal FROM users"
    );

    const users = result.rows;
    return res.status(200).json({ data: users });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/get/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      "SELECT user_id, name, email, dob, image, role, created_at, gender, height, weight, activity_level, calorie_intake, calorie_burn, weight_goal FROM users WHERE user_id = $1",
      [user_id]
    );

    const user = result.rows;

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/update", async (req, res) => {
  try {
    const {
      user_id,
      name,
      dob,
      gender,
      weight,
      height,
      calorie_burn,
      calorie_intake,
      image,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );
    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const beforeUpdate = userCheck.rows[0];

    const currentDate = new Date();

    if (new Date(dob) >= currentDate) {
      return res
        .status(400)
        .json({ message: "Invalid date of birth received." });
    }

    if (!(gender !== "Male" || gender !== "Female")) {
      return res.status(400).json({ message: "Invalid gender received." });
    }

    if (weight <= 15 || weight >= 400) {
      return res.status(400).json({ message: "Invalid weight received." });
    }

    if (height <= 10 || height >= 250) {
      return res.status(400).json({ message: "Invalid height received." });
    }

    if (calorie_burn < 1200 || calorie_burn > 4000) {
      return res
        .status(400)
        .json({ message: "Invalid calorie burn received." });
    }

    if (calorie_intake < 1200 || calorie_intake > 4000) {
      return res
        .status(400)
        .json({ message: "Invalid calorie intake received." });
    }

    const result = await pool.query(
      `UPDATE users
    SET name = $1, dob = $2, gender = $3, weight = $4, height = $5, calorie_burn = $6, calorie_intake = $7, image = $8
    WHERE user_id = $9 
    RETURNING *`,
      [
        name,
        dob,
        gender,
        weight,
        height,
        calorie_burn,
        calorie_intake,
        image,
        user_id,
      ]
    );

    const user = result.rows[0];
    const isVerified = user.isVerified;
    const currentWeight = beforeUpdate.weight;
    console.log("🚀 ~ currentWeight:", currentWeight);
    console.log("🚀 ~ weight:", weight);

    console.log(currentWeight === weight);
    console.log(currentWeight == weight);

    if (currentWeight !== weight) {
      await pool.query(
        `INSERT INTO weight_progress (user_id, weight) VALUES ($1, $2)`,
        [user_id, weight]
      );
    }

    const token = jwt.sign({ user: user }, process.env.SECRET_KEY);

    return res.status(201).json({
      token: token,
      isVerified: isVerified,
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/weight/:id/:range", async (req, res) => {
  try {
    const { id, range } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );
    if (userCheck.rowCount < 1) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    let result;

    if (range || !range == null || !range == 0) {
      const currentDate = new Date();
      const newDate = new Date();

      newDate.setDate(currentDate.getDate() - range);

      result = await pool.query(
        `SELECT * FROM weight_progress WHERE user_id = $1 AND log_date >= $2 ORDER BY log_date ASC`,
        [id, newDate]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM weight_progress WHERE user_id = $1 ORDER BY log_date ASC`,
        [id]
      );
    }

    const weightLogs = result.rows;

    return res.status(200).json(weightLogs);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/weight/log", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, weight, date } = req.body;
    console.log("🚀 ~ date:", date);

    if (!user_id || !weight) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (weight <= 15 || weight > 350) {
      return res.status(400).json({ message: "Invalid weight received." });
    }

    const currentDate = new Date();
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const logCheck = await pool.query(
      `SELECT * FROM weight_progress WHERE user_id = $1 AND log_date = $2`,
      [user_id, logDate]
    );

    if (logCheck.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "Weight already logged for that date." });
    }

    if (date && logDate > currentDate) {
      return res.status(400).json({ message: "Invalid date provided." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );

    if (userCheck.rowCount < 1) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    await client.query(`BEGIN`);

    await client.query(
      `INSERT INTO weight_progress (user_id, weight, log_date) VALUES($1, $2, $3)`,
      [user_id, weight, date]
    );

    if (logDate.toISOString() === currentDate.toISOString()) {
      await client.query(`UPDATE users SET weight =$1 WHERE user_id = $2`, [
        weight,
        user_id,
      ]);
    }

    await client.query(`COMMIT`);

    return res.status(200).json({ message: "Weight logged successfully." });
  } catch (error) {
    await client.query(`ROLLBACK`);
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/add/trainer", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, gender, age, shift, startTime, endTime } = req.body;

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

    if (age < 15 || age > 100) {
      return res.status(400).json({ message: "Invalid age. Try again." });
    }

    if (!isValidShift(shift, startTime, endTime)) {
      return res.status(400).json({ message: "Invalid start and end times." });
    }

    const role = "trainer";
    const isVerified = true;

    const check = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const password = crypto.randomBytes(3).toString("hex");
    console.log("🚀 ~ password:", password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await client.query(`BEGIN`);

    const subject = "Account Created at Uthau";
    const fName = name.split(" ")[0];
    const body = `Hi ${fName},\nCongratulations on joining our gym as a trainer! 🎉 We're thrilled to have you on board and excited to see the positive impact you'll make on our members' fitness journeys. Welcome to the team!\nHere is your password '${password}'. Feel free to change it anytime.\nLooking forward to working together,\n\nUthau Team`;

    sendMail(email, subject, body);

    const result = await pool.query(
      "INSERT INTO users(name, email, gender, age, password, role, isVerified) VALUES ($1, $2, $3, $4, $5, $6, $7)  RETURNING *",
      [name, email, gender, age, hashedPassword, role, isVerified]
    );

    const user = result.rows[0];

    const user_id = user.user_id;

    await client.query(
      "INSERT INTO trainers(trainer_id, start_time, end_time, shift) VALUES ($1, $2, $3, $4)",
      [user_id, startTime, endTime, shift]
    );

    client.query(`COMMIT`);

    return res
      .status(200)
      .json({ message: "Trainer profile created successfully." });
  } catch (error) {
    client.query(`ROLLBACK`);
    console.log("🚀 ~ add trainer error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/delete/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id || user_id == null) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const check = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (check.rowCount < 0) {
      return res.status(400).json({ message: "No user found." });
    }

    await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.log("🚀 ~ delete user error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/members/get-all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members");

    const members = result.rows;
    return res.status(200).json({ data: members });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/members/get/:member_id", async (req, res) => {
  try {
    const { member_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM members WHERE member_id = $1",
      [member_id]
    );

    const member = result.rows;
    return res.status(200).json({ data: member });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/trainers/get-all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trainers");

    const trainers = result.rows;
    return res.status(200).json({ data: trainers });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/update/location", async (req, res) => {
  try {
    const { user_id, lat, lng } = req.body;

    if (!user_id || !lat || !lng) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (result.rowCount <= 0) {
      return res.status(400).json({ message: "User not found." });
    }

    await pool.query(
      "UPDATE users SET latitude = $1, longitude = $2 WHERE user_id = $3",
      [lat, lng, user_id]
    );

    return res
      .status(200)
      .json({ message: "User location updated successfully." });
  } catch (error) {
    console.log("🚀 ~ usersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/get-all", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || user_id == "undefined") {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      `SELECT 
      p.sender_id,
      p.receiver_id,
        u.user_id,
        u.name,
        u.email,
        u.image,
        u.longitude,
        u.latitude,
      p.isConnected
    FROM 
        users u
    JOIN 
        partners p ON (u.user_id = p.sender_id OR u.user_id = p.receiver_id)
    WHERE 
        (p.sender_id = $1 OR p.receiver_id = $1)
      AND u.user_id <> $1
        AND p.isConnected = true`,
      [user_id]
    );

    const connections = result.rows;

    return res.status(200).json({ data: connections });
  } catch (error) {
    console.log("🚀 ~ ussersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/get-nearby", async (req, res) => {
  try {
    const { lat, lng, radius, user_id } = req.query;

    if (!lat || !lng || !radius || !user_id || user_id == "undefined") {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userLocation = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    };

    const result = await pool.query(
      `SELECT 
      u.user_id,
      u.name,
      u.role,
      u.email,
      u.image,
      u.longitude,
      u.latitude
  FROM 
      users u
  LEFT JOIN 
      partners p ON (u.user_id = p.sender_id OR u.user_id = p.receiver_id)
                  AND (p.sender_id = $1 OR p.receiver_id = $1)
                  AND p.isConnected = true
  WHERE 
      u.user_id <> $1
      AND p.sender_id IS NULL
      AND p.receiver_id IS NULL
      AND u.isverified = true
    AND u.longitude IS NOT NULL
    AND u.latitude IS NOT NULL`,
      [user_id]
    );

    const users = result.rows;

    const userDistance = [];

    users.filter((user) => {
      if (user.role === "trainer") {
        return;
      }

      const longitude = user.longitude;
      const latitude = user.latitude;

      if (!longitude || !latitude) {
        return;
      }

      const location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const distance = calculateDistance(location, userLocation);

      if (distance <= parseFloat(radius)) {
        userDistance.push({ user_id: user.user_id, distance: distance });
      }
    });

    const combine = users.map((user) => {
      const match = userDistance.find(
        (distance) => distance.user_id === user.user_id
      );

      if (match) {
        return {
          ...user,
          ...match,
        };
      }

      return user;
    });

    const nearbyUsers = combine.filter((user) => {
      if (user.distance != undefined || user.distance != null) {
        return true;
      }
    });

    return res.status(200).json(nearbyUsers);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/requests/received", async (req, res) => {
  try {
    const { lat, lng, radius, user_id } = req.query;

    if (!lat || !lng || !radius || !user_id || user_id == "undefined") {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userLocation = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    };

    const requestResult = await pool.query(
      `SELECT DISTINCT p.sender_id, u.name, u.email, u.image, u.longitude, u.latitude
      FROM partners p 
      JOIN users u ON 
      u.user_id = p.sender_id
      WHERE p.receiver_id = $1 AND p.isconnected = false`,
      [user_id]
    );

    const users = requestResult.rows;

    const userDistance = [];

    users.filter((user) => {
      const longitude = user.longitude;
      const latitude = user.latitude;

      if (!longitude || !latitude) {
        return;
      }

      const location = {
        latitude: latitude,
        longitude: longitude,
      };

      const distance = calculateDistance(location, userLocation);

      if (distance <= parseFloat(radius)) {
        userDistance.push({ user_id: user.sender_id, distance: distance });
      }
      console.log(userDistance);
    });

    const combine = users.map((user) => {
      const match = userDistance.find(
        (distance) => distance.user_id === user.sender_id
      );

      if (match) {
        return {
          ...user,
          ...match,
        };
      }

      return user;
    });

    const requests = combine.filter((user) => {
      if (user.distance != undefined || user.distance != null) {
        return true;
      }
    });
    console.log("🚀 ~ requests:", requests);

    return res.status(200).json(requests);
  } catch (error) {
    console.log("🚀 ~ .js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/requests/sent", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || user_id == "undefined") {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      "SELECT * FROM partners WHERE sender_id = $1 AND isconnected = false",
      [user_id]
    );

    const requests = result.rows;
    console.log("🚀 ~ requests:", requests);

    return res.status(200).json(requests);
  } catch (error) {
    console.log("🚀 ~ useRouter.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🚀 ~ req.query:", req.query);

    if (!id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const result = await pool.query(
      `SELECT * FROM partners WHERE isconnected = false AND (sender_id = $1 OR receiver_id = $1)`,
      [id]
    );

    const requests = result.rows;

    return res.status(200).json(requests);
  } catch (error) {
    console.log("🚀 ~ /friends/requests/ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/friends/requests/send", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        message: "Invalid request.",
      });
    }

    if (sender_id === receiver_id) {
      return res.status(400).json({
        message: "Can't send a request to yourself.",
      });
    }

    const senderCheck = await pool.query(
      "SELECT * FROM users WHERE (role = 'normal' OR role = 'member') AND user_id = $1",
      [sender_id]
    );

    const receiverCheck = await pool.query(
      "SELECT * FROM users WHERE (role = 'normal' OR role = 'member') AND user_id = $1",
      [receiver_id]
    );

    if (senderCheck.rowCount <= 0 || receiverCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "Either sender or receiver not found.",
      });
    }

    const check = await pool.query(
      "SELECT * FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [sender_id, receiver_id]
    );

    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Request is already sent." });
    }

    await pool.query(
      "INSERT INTO partners(sender_id, receiver_id) VALUES ($1, $2)",
      [sender_id, receiver_id]
    );

    return res.status(200).json({ message: "Request sent successfully." });
  } catch (error) {
    console.log("🚀 ~ usersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/friends/requests/remove", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        message: "Invalid request.",
      });
    }

    const check = await pool.query(
      "SELECT * FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [sender_id, receiver_id]
    );

    if (check.rowCount <= 0) {
      return res.status(400).json({ message: "Partner request not found." });
    }

    const requests = check.rows[0];
    console.log("🚀 ~ requests sent:", requests);

    if (requests.isconnected) {
      return res.status(400).json({
        message: "Request is already accepted. It can't be removed now.",
      });
    }

    await pool.query(
      "DELETE FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [sender_id, receiver_id]
    );

    return res.status(200).json({ message: "Request removed successfully." });
  } catch (error) {
    console.log("🚀 ~ usersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/friends/requests/accept", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      `UPDATE partners
    SET isconnected = true
    WHERE sender_id = $1 AND receiver_id = $2
    RETURNING *`,
      [sender_id, receiver_id]
    );
    console.log("🚀 ~ result:", result);

    if (result.rowCount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Sender or receiver not found." });
    }

    return res.status(200).json({ message: "Request accepted successfully." });
  } catch (error) {
    console.log("🚀 ~ usersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/friends/requests/reject", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const requestCheck = await pool.query(
      `SELECT * FROM partners WHERE sender_id = $1 AND receiver_id = $2`,
      [sender_id, receiver_id]
    );

    if (requestCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested friend request was not found." });
    }

    await pool.query(
      `DELETE FROM partners
      WHERE sender_id = $1 AND receiver_id = $2`,
      [sender_id, receiver_id]
    );

    return res.status(200).json({ message: "Request rejected successfully." });
  } catch (error) {
    console.log("🚀 ~ usersRoute.js error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/friends/remove", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const partnerCheck = pool.query(
      `SELECT * FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (receiver_id = $1 AND sender_id = $2)`,
      [sender_id, receiver_id]
    );

    if ((await partnerCheck).rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested users are not friends. " });
    }

    await pool.query(
      `DELETE FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (receiver_id = $1 AND sender_id = $2)`,
      [sender_id, receiver_id]
    );

    return res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.log("🚀 ~ /friends/remove error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/friends/:id/:id2", async (req, res) => {
  try {
    const { id, id2 } = req.params;

    if (!id || !id2) {
      return res.status(400).json({ message: "Invalid request. " });
    }

    const check = await pool.query(
      `SELECT * FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (receiver_id = $1 AND sender_id = $2)`,
      [id, id2]
    );

    if (check.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested users are not friends." });
    }

    const partners = check.rows[0];

    return res.status(200).json(partners);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/steps/log", async (req, res) => {
  try {
    const { user_id, steps } = req.body;

    if (!user_id || !steps) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (steps < 0) {
      return res.status(400).json({ message: "Invalid steps received." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );
    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const logCheck = await pool.query(
      `SELECT * FROM step_logs WHERE user_id = $1 AND date = CURRENT_DATE`,
      [user_id]
    );

    if (logCheck.rowCount <= 0) {
      await pool.query(
        `INSERT INTO step_logs (user_id, steps) VALUES ($1, $2)`,
        [user_id, steps]
      );
    } else {
      await pool.query(`UPDATE step_logs SET steps = $1 WHERE user_id = $2`, [
        steps,
        user_id,
      ]);
    }

    return res.status(200).json({ message: "Step logged successfully." });
  } catch (error) {
    console.log("🚀 ~ /steps/log error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/steps/log/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const logsCheck = await pool.query(
      `SELECT * FROM step_logs WHERE user_id = $1 AND date = CURRENT_DATE`,
      [id]
    );
    const logs = logsCheck.rows;

    return res.status(200).json(logs);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/ar/points", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );
    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const logCheck = await pool.query(
      `SELECT * FROM step_logs WHERE user_id = $1 AND date = CURRENT_DATE`,
      [user_id]
    );

    const log = logCheck.rows[0];
    console.log("🚀 ~ log:", log);

    const log_id = log.log_id;
    const steps = log.steps;
    const claimed = log.claimed;

    if (steps < 10000) {
      return res.status(400).json({ message: "Goal is not completed yet." });
    }

    if (claimed) {
      return res
        .status(400)
        .json({ message: "Points already claimed for today." });
    }

    const points = 50;

    await client.query(`BEGIN`);

    await client.query(
      `UPDATE step_logs SET claimed = true WHERE user_id = $1 AND date = CURRENT_DATE`,
      [user_id]
    );

    await client.query(
      `INSERT INTO ar_points (user_id, points, log_id) VALUES ($1, $2, $3)`,
      [user_id, points, log_id]
    );

    await client.query(`COMMIT`);

    return res
      .status(200)
      .json({ message: "Congratulations! Points awarded." });
  } catch (error) {
    await client.query(`ROLLBACK`);
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/ar/points/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const pointsCheck = await pool.query(
      `SELECT * FROM ar_points WHERE user_id = $1`,
      [id]
    );

    const points = pointsCheck.rows;
    console.log("🚀 ~ points:", points);

    const totalPoints = points.reduce((total, curr) => total + curr.points, 0);

    return res.status(200).json(totalPoints);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internaal server error. Try again later." });
  }
});

module.exports = router;
