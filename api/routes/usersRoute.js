const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

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

router.get("/get", async (req, res) => {
  const { user_id } = req.query;
  console.log("🚀 ~ user_id:", user_id);

  try {
    const result = await pool.query(
      "SELECT user_id, name, email, image, role, created_at, age, gender, height, weight, activity_level, calorie_intake, calorie_burn, weight_goal FROM users WHERE user_id = $1",
      [user_id]
    );

    const user = result.rows;

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("🚀 ~ usersRoute.js getuser error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error. Try again later." });
  }
});

router.post("/add/trainer", async (req, res) => {
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
      "INSERT INTO trainers(trainer_id, start_time, end_time, shift) VALUES ($1, $2, $3, $4)",
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
      u.image,
      u.longitude,
      u.latitude
  FROM 
      users u
  WHERE 
      u.user_id <> $1
      AND NOT EXISTS (
          SELECT 1
          FROM partners p
          WHERE (u.user_id = p.sender_id OR u.user_id = p.receiver_id)
              AND (p.sender_id = $1 OR p.receiver_id = $1)
              AND p.isConnected = true
      );`,
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
        latitude: latitude,
        longitude: longitude,
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
      `SELECT DISTINCT p.sender_id, u.name, u.image, u.longitude, u.latitude
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
        message: "Invalid request. Can't send a request to yourself.",
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
        message: "Invalid request. Either sender or receiver not found.",
      });
    }

    const check = await pool.query(
      "SELECT * FROM partners WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [sender_id, receiver_id]
    );

    if (check.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Request is already sent." });
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

module.exports = router;
