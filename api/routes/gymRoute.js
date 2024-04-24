const express = require("express");
const { pool } = require("../dbConfig");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const axios = require("axios");

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateExpiryDate(planDuration) {
  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setMonth(expiryDate.getMonth() + planDuration);
  return formatDate(expiryDate);
}

const convertMetric = (numberToconvert, numOfServings) => {
  if (!numberToconvert || !numOfServings) return null;
  return Math.round(numberToconvert / numOfServings);
};

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
    return true;
  } catch (error) {
    console.log("🚀 ~ gymRoute.js sendMail ~ error:", error);
    return false;
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Endpoint to create announcements
router.post("/announcement/create", async (req, res) => {
  try {
    const { title, description, prize, fee, start_date, start_time, deadline } =
      req.body;

    if (
      !title ||
      !description ||
      !prize ||
      !fee ||
      !start_date ||
      !start_time ||
      !deadline
    ) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (prize <= 0) {
      return res
        .status(400)
        .json({ message: "Prize amount must be greater than 0." });
    }

    if (fee <= 0) {
      return res
        .status(400)
        .json({ message: "Entry fee must be greater than 0." });
    }

    if (new Date(start_date) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid start date. Date can't be in the past." });
    }

    if (new Date(deadline) >= new Date(start_date)) {
      return res
        .status(400)
        .json({ message: "Deadline must be before start date." });
    }

    await pool.query(
      `
INSERT INTO fitness_competitions (title, description, prize_amount, start_date, start_time, entry_fee, entry_deadline)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`,
      [title, description, prize, start_date, start_time, fee, deadline]
    );

    return res
      .status(200)
      .json({ message: "Announcement created successfully." });
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /announcement/create error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get all announcements
router.get("/announcement", async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
      fc.*,
      COUNT(p.payment_id) AS entries
  FROM 
      fitness_competitions fc
  LEFT JOIN 
      comp_participants cp ON fc.fitness_competition_id = cp.fitness_competition_id
  LEFT JOIN 
      payments p ON cp.payment_id = p.payment_id AND p.status = 'Completed'
  GROUP BY 
      fc.fitness_competition_id
  ORDER BY
    posted_date DESC`);

    const announcements = result.rows.map((announcement) => {
      // Format the start_date and entry_deadline here
      const formattedStartDate = formatDate(announcement.start_date);
      const formattedEntryDeadline = formatDate(announcement.entry_deadline);

      // Return the announcement with formatted dates
      return {
        ...announcement,
        start_date: formattedStartDate,
        entry_deadline: formattedEntryDeadline,
      };
    });

    return res.status(200).json(announcements);
  } catch (error) {
    console.log("🚀 ~ gymRoute.js announcement/all error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get announcement by id
router.get("/announcement/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      `SELECT 
      fc.*,
      COUNT(p.payment_id) AS entries
  FROM 
      fitness_competitions fc
  LEFT JOIN 
      comp_participants cp ON fc.fitness_competition_id = cp.fitness_competition_id
  LEFT JOIN 
      payments p ON cp.payment_id = p.payment_id AND p.status = 'Completed'
      WHERE fc.fitness_competition_id = $1
  GROUP BY 
      fc.fitness_competition_id
  ORDER BY
    posted_date DESC`,
      [id]
    );

    if (result.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested announcement was not found." });
    }

    const announcement = result.rows;

    return res.status(200).json(announcement);
  } catch (error) {
    console.log("🚀 ~ gymRoute.js announcement/all error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to update announcements
router.post("/announcement/:id/update", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prize, fee, start_date, start_time, deadline } =
      req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid request. Announcement id required." });
    }

    if (
      !title ||
      !description ||
      !prize ||
      !fee ||
      !start_date ||
      !start_time ||
      !deadline
    ) {
      return res
        .status(400)
        .json({ message: "Invalid request. All fields are required." });
    }

    const announcement = await pool.query(
      "SELECT * FROM fitness_competitions WHERE fitness_competition_id = $1",
      [id]
    );

    if (announcement.rowCount == 0) {
      return res
        .status(404)
        .json({ message: "The reqested announcement was not found." });
    }

    const existingEntries = await pool.query(
      "SELECT * FROM comp_participants WHERE fitness_competition_id = $1",
      [id]
    );

    if (existingEntries.rowCount > 0) {
      await pool.query(
        `UPDATE fitness_competitions
      SET title = $1, description = $2, entry_deadline = $3 WHERE fitness_competition_id = $4`,
        [title, description, deadline, id]
      );
    } else {
      await pool.query(
        `UPDATE fitness_competitions
    SET title = $1, description = $2, prize_amount = $3, entry_fee = $4, start_date = $5, start_time = $6, entry_deadline = $7 WHERE fitness_competition_id = $8`,
        [title, description, prize, fee, start_date, start_time, deadline, id]
      );
    }

    return res
      .status(200)
      .json({ message: "Announcement updated successfully." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to delete announcement by id
router.delete("/announcement/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid request. Announcement ID is missing." });
    }

    const announcement = await pool.query(
      "SELECT * FROM fitness_competitions WHERE fitness_competition_id = $1",
      [id]
    );

    if (announcement.rows.length == 0) {
      return res
        .status(404)
        .json({ message: "The reqested announcement was not found." });
    }

    const existingEntries = await pool.query(
      "SELECT * FROM comp_participants WHERE fitness_competition_id = $1",
      [id]
    );

    if (existingEntries.rows.length > 0) {
      return res.status(400).json({
        message:
          "The requested announcement cannot be deleted. There are existing entries associated with it.",
      });
    }

    await pool.query(
      "DELETE FROM fitness_competitions WHERE fitness_competition_id = $1",
      [id]
    );

    return res
      .status(200)
      .json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ gymRoute.js /announcement/:announcementId/delete error:",
      error
    );
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
      `
    SELECT f.* FROM comp_participants c 
    JOIN fitness_competitions f ON f.fitness_competition_id = c.fitness_competition_id
    JOIN payments p ON p.payment_id = c.payment_id
    JOIN users u ON u.user_id = p.user_id
    WHERE u.user_id = $1
    AND LOWER(p.status) = LOWER('completed')
    `,
      [id]
    );

    const entries = result.rows;

    return res.status(200).json(entries);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get all plans
router.get("/plan", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM plans ORDER BY duration ASC`
    );

    const plans = result.rows;

    return res.status(200).json(plans);
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /plan error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to create a plan
router.post("/plan/create", async (req, res) => {
  try {
    const { duration, amount } = req.body;

    if (!duration || !amount) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (duration < 1 || duration > 50) {
      return res.status(400).send({ message: "Invalid duration." });
    }

    if (amount <= 0) {
      return res.status(400).send({ message: "Invalid amount." });
    }

    const check = await pool.query(`SELECT * FROM plans WHERE duration = $1`, [
      duration,
    ]);

    if (check.rowCount > 0) {
      return res.status(409).json({
        message: "A plan with the specified duration already exists.",
      });
    }

    await pool.query(
      `INSERT INTO plans(
      duration, amount)
      VALUES ($1, $2)`,
      [duration, amount]
    );

    return res.status(201).json({ message: "Plan created successfully." });
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /plan/create error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to update a plan
router.post("/plan/:id/update", async (req, res) => {
  try {
    const { id } = req.params;

    const { amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const plan = await pool.query(`SELECT * FROM plans WHERE plan_id = $1`, [
      id,
    ]);

    if (plan.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested plan was not found." });
    }

    if (amount <= 0) {
      return res.status(400).send({ message: "Invalid amount." });
    }

    await pool.query(
      `UPDATE public.plans
      SET amount=$1
      WHERE plan_id = $2`,
      [amount, id]
    );

    return res.status(201).json({ message: "Plan updated successfully." });
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /plan/create error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to delete a plan
router.delete("/plan/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await pool.query(`SELECT * FROM plans WHERE plan_id = $1`, [
      id,
    ]);

    if (plan.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested plan was not found." });
    }

    const check = await pool.query(
      `SELECT * FROM membership WHERE plan_id = $1`,
      [id]
    );

    if (check.rowCount > 0) {
      return res.status(400).json({
        message:
          "The requested plan cannot be deleted. There are existing members associated with it.",
      });
    }

    await pool.query(`DELETE FROM plans WHERE plan_id = $1`, [id]);

    return res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    console.log("🚀 ~ gymRoute /plan/:id/delete error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get all members
router.get("/member", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT m.*, CASE
      WHEN expiry_date > CURRENT_DATE THEN 'Active'
      WHEN expiry_date < CURRENT_DATE THEN 'Expired'
      WHEN expiry_date IS NULL AND is_cancelled = TRUE THEN 'Cancelled'
    END AS status,u.email as user_email, s.name as trainer_name, t.* FROM members m
    LEFT JOIN users u ON u.user_id = m.user_id
    LEFT JOIN trainer_assignment a ON a.member_id = m.member_id
    LEFT JOIN trainers t ON t.trainer_id = a.trainer_id
    LEFT JOIN users s ON s.user_id = t.trainer_id
    ORDER BY m.name`);

    const members = result.rows;

    return res.status(200).json(members);
  } catch (error) {
    console.log("🚀 ~ gymRoute /member error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get member by id
router.get("/member/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id == undefined) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      `SELECT m.*, CASE
      WHEN expiry_date > CURRENT_DATE THEN 'Active'
      WHEN expiry_date < CURRENT_DATE THEN 'Expired'
      WHEN expiry_date IS NULL AND is_cancelled = TRUE THEN 'Cancelled'
    END AS status, u.email as user_email, s.name as trainer_name, t.*, p.* FROM members m
    JOIN plans p ON p.plan_id = m.plan_id
    LEFT JOIN users u ON u.user_id = m.user_id
    LEFT JOIN trainer_assignment a ON a.member_id = m.member_id
    LEFT JOIN trainers t ON t.trainer_id = a.trainer_id
    LEFT JOIN users s ON s.user_id = t.trainer_id
    WHERE m.user_id = $1`,
      [id]
    );

    if (result.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const member = result.rows[0];

    return res.status(200).json(member);
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /member/:id error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to create a new member
router.post("/member/create", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, phone, plan_id, amount, remarks } = req.body;

    if (!name || !email || !phone || !plan_id || !amount) {
      return res.status(400).json({ message: "Invalid request." });
    }

    await client.query("BEGIN");

    const memberCheck = await client.query(
      `SELECT m.*, u.email as user_email FROM members m
      LEFT JOIN users u ON u.user_id = m.user_id WHERE phone = $1 OR m.email = $2 OR u.email = $2`,
      [phone, email]
    );

    if (memberCheck.rowCount > 0) {
      return res.status(400).json({
        message: "A member with the provided details already exists.",
      });
    }

    const planCheck = await client.query(
      `SELECT * FROM plans WHERE plan_id = $1`,
      [plan_id]
    );
    if (planCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested plan was not found." });
    }
    const plan = planCheck.rows[0];
    const planAmount = plan.amount;
    const planDuration = plan.duration;

    if (planAmount !== amount) {
      return res.status(400).json({
        message: "The amount doesn't match with the actual amount of the plan.",
      });
    }

    const expiry_date = calculateExpiryDate(planDuration);

    const result = await client.query(
      `
      INSERT INTO members (name, email, phone, expiry_date, plan_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [name, email, phone, expiry_date, plan_id]
    );

    const member = result.rows[0];
    const member_id = member.member_id;

    await client.query(
      `
      INSERT INTO payments (payment_amount, remarks, member_id, status)
      VALUES ($1, $2, $3, $4)
    `,
      [amount, remarks, member_id, "Completed"]
    );

    await client.query("COMMIT");

    return res
      .status(200)
      .json({ message: "Membership created successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ gymRoute.js /member/create error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/member/convert/request", async (req, res) => {
  try {
    const { email, code } = req.body;

    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const user = userCheck.rows[0];
    const user_id = user.user_id;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE user_id = $1`,
      [user_id]
    );

    if (memberCheck.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "The requested user is already a member." });
    }

    const member_code = user.member_code;

    if (member_code !== code) {
      return res.status(400).json({
        message: "The provided member code was incorrect. Try again.",
      });
    }

    const result = await pool.query(
      `UPDATE users SET role = 'member' WHERE user_id = $1 AND email = $2 RETURNING *`,
      [user_id, email]
    );

    const convertedUser = result.rows[0];

    return res.status(200).json({
      message: "Membership claimed successfully.",
      user: convertedUser,
    });
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /member/convert error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to convert a user to member
router.post("/member/convert", async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, remarks, user_id, plan_id, phone } = req.body;
    await client.query("BEGIN");

    const userCheck = await client.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [user_id]
    );

    const user = userCheck.rows[0];
    const name = user.name;

    const planCheck = await client.query(
      `SELECT * FROM plans WHERE plan_id = $1`,
      [plan_id]
    );

    if (planCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested plan was not found." });
    }

    const plan = planCheck.rows[0];
    const planDuration = plan.duration;

    const check = await client.query(
      `SELECT * FROM members WHERE user_id = $1`,
      [user_id]
    );

    if (check.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "The requested user is already a member." });
    }

    const expiry_date = calculateExpiryDate(planDuration);

    const result = await client.query(
      `
    INSERT INTO members (expiry_date, plan_id, user_id, phone, name)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
      [expiry_date, plan_id, user_id, phone, name]
    );

    const memberCode = crypto.randomInt(1000000);

    await client.query(
      `UPDATE users SET role = 'member', member_code = $1 WHERE user_id = $2`,
      [memberCode, user_id]
    );

    const subject = "Membership Activated";
    const fName = name.split(" ")[0];
    const body = `Hi ${fName},
    \nI hope this email finds you well. This email is regarding your membership at Uthau.'
    \nThe code for activation: ' ${memberCode} '. Use this code to activate your membership.
    \nThank you for the activation.
    \nRegards,\nUthau Team
    `;

    const email = user.email;

    const sent = await sendMail(email, subject, body);

    if (!sent) {
      return res
        .status(500)
        .json({ message: "This request can't be completed at the moment." });
    }

    const newMember = result.rows[0];
    const member_id = newMember.member_id;

    await client.query(
      `
      INSERT INTO payments (payment_amount, remarks, member_id)
      VALUES ($1, $2, $3)
    `,
      [amount, remarks, member_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "User converted to member successfully.",
      code: memberCode,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/member/convert/check/", async (req, res) => {
  try {
    const { email, plan_id } = req.body;

    if (!email || !plan_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const user = userCheck.rows[0];
    const user_id = user.user_id;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE user_id = $1`,
      [user_id]
    );

    if (memberCheck.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "The requested user is already a member. " });
    }

    const planCheck = await pool.query(
      `SELECT * FROM plans WHERE plan_id = $1`,
      [plan_id]
    );

    if (planCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested plan was not found." });
    }

    const plan = planCheck.rows[0];
    const amount = plan.amount;

    return res.status(200).json({
      message: "Details verified.",
      amount: amount,
      plan_id: plan_id,
      user_id: user_id,
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/member/payment/convert", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, payment_id } = req.body;

    if (!user_id || !payment_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1 AND role = 'normal'`,
      [user_id]
    );
    if (userCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "The requested user was not found or is already a member.",
      });
    }

    const user = userCheck.rows[0];
    const name = user.name;
    const email = user.email;

    const paymentCheck = await pool.query(
      `SELECT * FROM payments WHERE payment_id = $1`,
      [payment_id]
    );

    if (paymentCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "The requested payment was not found.",
      });
    }

    const planCheck = await pool.query(
      `SELECT * FROM membership_transactions mt
    JOIN plans p ON p.plan_id = mt.plan_id
    WHERE mt.payment_id = $1`,
      [payment_id]
    );

    const plan = planCheck.rows[0];
    const plan_id = plan.plan_id;
    const planDuration = plan.duration;

    const payment = paymentCheck.rows[0];
    const status = payment.status;

    if (status !== "Completed") {
      return res.status(400).json({ message: "Payment is not yet completed." });
    }

    await client.query("BEGIN");

    const expiry_date = calculateExpiryDate(planDuration);
    console.log("🚀 ~ expiry_date:", expiry_date);

    await client.query(
      `
    INSERT INTO members (expiry_date, plan_id, user_id, name, email)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
      [expiry_date, plan_id, user_id, name, email]
    );

    const updatedUser = await client.query(
      `UPDATE users SET role = 'member' WHERE user_id = $1  RETURNING *`,
      [user_id]
    );

    await client.query("COMMIT");

    const token = jwt.sign(
      { user: updatedUser.rows[0] },
      process.env.SECRET_KEY
    );

    return res
      .status(200)
      .json({ message: "Converted to member successfully.", token: token });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to renew membership
router.post("/member/renew", async (req, res) => {
  const client = await pool.connect();
  try {
    const { member_id, plan_id, amount, remarks } = req.body;

    if (!member_id || !plan_id || !amount) {
      return res.status(400).json({ message: "Invalid request." });
    }

    await client.query("BEGIN");

    const memberCheck = await client.query(
      `SELECT *,
      CASE
        WHEN expiry_date > CURRENT_DATE THEN 'Active'
        WHEN expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN expiry_date IS NULL AND is_cancelled = TRUE THEN 'Cancelled'
      END AS status FROM members 
      WHERE member_id = $1`,
      [member_id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const member = memberCheck.rows[0];

    if (member.status === "Active") {
      return res.status(400).json({
        message: "The membership of the requested member has not ended yet.",
      });
    }

    const planCheck = await client.query(
      `SELECT * FROM plans WHERE plan_id = $1`,
      [plan_id]
    );
    if (planCheck.rowCount <= 0) {
      return res
        .status(400)
        .json({ message: "The requested plan was not found." });
    }

    const plan = planCheck.rows[0];
    const duration = plan.duration;

    await client.query(
      `
      INSERT INTO renewal_transactions (member_id, amount, plan_id)
      VALUES ($1, $2, $3)`,
      [member_id, amount, plan_id]
    );

    const renewal_date = formatDate(new Date());
    const expiry_date = calculateExpiryDate(duration);

    await client.query(
      `
      UPDATE members
      SET renewal_date = $1, expiry_date = $2, plan_id = $3, is_cancelled = FALSE
      WHERE member_id = $4
    `,
      [renewal_date, expiry_date, plan_id, member_id]
    );

    await client.query(
      `
      INSERT INTO payments (payment_amount, remarks, member_id)
      VALUES ($1, $2, $3)
    `,
      [amount, remarks, member_id]
    );

    await client.query("COMMIT");

    return res
      .status(200)
      .json({ message: "Membership renewed successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ gymRoute.js /member/renew error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  } finally {
    client.release();
  }
});

// Endpoint to cancel membership
router.post("/member/cancel", async (req, res) => {
  const client = await pool.connect();
  try {
    const { member_id, reason } = req.body;

    if (!member_id || !reason) {
      return res.status(400).json({ message: "Invalid request." });
    }

    await client.query("BEGIN");

    const memberCheck = await client.query(
      `
      SELECT m.*, u.email, 
      CASE
        WHEN m.expiry_date > CURRENT_DATE THEN 'Active'
        WHEN m.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN expiry_date IS NULL AND is_cancelled = TRUE THEN 'Cancelled'
      END AS status  FROM members m 
    LEFT JOIN users u on u.user_id = m.user_id
    WHERE member_id = $1`,
      [member_id]
    );

    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const member = memberCheck.rows[0];
    const status = member.status;
    const email = member.email;

    if (status === "Cancelled") {
      return res.status(400).json({
        message: "The membership of the requested member is already cancelled.",
      });
    }

    const subject = "Regarding Membership Cancellation";
    const name = member.name;
    const fName = name.split(" ")[0];
    const body = `Hi ${fName},
    \nI hope this email finds you well. This email is regarding your membership at Uthau. The reason for the cancellation is: '${reason}'
    \nShould you have any outstanding dues, kindly settle them at your earliest convenience. If you have any questions or need further assistance, please feel free to reach out to our team at Uthau.
    \nThank you for your understanding, and we wish you all the best in your future endeavors.
    \nRegards,\nUthau Team
    `;

    if (email) {
      const sent = await sendMail(email, subject, body);

      if (!sent) {
        return res
          .status(500)
          .json({ message: "This request can't be completed at the moment." });
      }
    }

    await client.query(
      `UPDATE members SET expiry_date = NULL, is_cancelled = TRUE WHERE member_id = $1`,
      [member_id]
    );

    await client.query(`DELETE FROM trainer_assignment WHERE member_id = $1`, [
      member_id,
    ]);

    await client.query("COMMIT");

    return res
      .status(200)
      .json({ message: "The membership has been cancelled successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ gymRoute.js /member/cancel error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to update member details
router.post("/member/:id/update", async (req, res) => {});

// Endpoint to delete a member
router.delete("/member/:id/delete", async (req, res) => {});

// Endpoint to assign a trainer
router.post("/member/trainer/assign", async (req, res) => {
  try {
    const { member_id, trainer_id } = req.body;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [member_id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const trainerCheck = await pool.query(
      `SELECT * FROM trainers WHERE trainer_id = $1`,
      [trainer_id]
    );
    if (trainerCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested trainer was not found." });
    }

    await pool.query(
      `INSERT INTO trainer_assignment (trainer_id, member_id) VALUES ($1, $2)`,
      [trainer_id, member_id]
    );

    return res.status(200).json({
      message: "Trainer assigned to the requested member successfully.",
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to remove assigned trainer
router.delete("/member/trainer/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(500).json({ message: "Invalid request." });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const trainerAssignment = await pool.query(
      `SELECT * FROM trainer_assignment WHERE member_id = $1`,
      [id]
    );
    if (trainerAssignment.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member has no trainer assigned." });
    }

    await pool.query(`DELETE FROM trainer_assignment WHERE member_id = $1`, [
      id,
    ]);

    return res.status(200).json({
      message: "Trainer un-assigned for the requested member successfully.",
    });
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /member/trainer/remove/:id error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get all trainers
router.get("/trainer", async (req, res) => {
  try {
    const result = await pool.query(`SELECT t.*, u.name, u.email 
    FROM trainers t
    JOIN users u ON u.user_id = t.trainer_id`);

    const trainers = result.rows;

    return res.status(200).json(trainers);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get a trainer's students
router.get("/trainer/students/:trainer_id", async (req, res) => {
  try {
    const { trainer_id } = req.params;

    const trainerCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [trainer_id]
    );

    if (trainerCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const trainer = trainerCheck.rows[0];
    const role = trainer.role;

    if (role !== "trainer") {
      return res
        .status(401)
        .json({ message: "The requested user is not authorized." });
    }

    const result = await pool.query(
      `SELECT * FROM trainer_assignment t
    JOIN members m ON m.member_id = t.member_id
    WHERE t.trainer_id = $1`,
      [trainer_id]
    );

    const students = result.rows;

    return res.status(200).json(students);
  } catch (error) {
    console.log("🚀 ~ trainer/students error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to save evaluation
router.post("/trainer/evaluate", async (req, res) => {
  const client = await pool.connect();
  try {
    const { trainer_id, member_id, grades, note } = req.body;

    if (!trainer_id || !member_id || !grades) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const metricsArray = Object.entries(grades).map(([id, grade]) => ({
      metrics_id: parseInt(id),
      grade,
    }));

    const trainerCheck = await pool.query(
      `SELECT * FROM trainers WHERE trainer_id = $1`,
      [trainer_id]
    );

    if (trainerCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested trainer was not found." });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id  = $1`,
      [member_id]
    );

    if (memberCheck.rowCount < 1) {
      return res
        .status(404)
        .send({ message: "The requested member was not found." });
    }

    const evaluationCheck = await pool.query(
      `SELECT *
    FROM public.evaluations
    WHERE member_id = $1
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [member_id]
    );

    if (evaluationCheck.rowCount > 0) {
      return res.status(400).json({
        message: "This member has already been evaluated for the month.",
      });
    }

    const assignemnetCheck = await pool.query(
      `SELECT * FROM trainer_assignment WHERE trainer_id = $1 AND member_id = $2`,
      [trainer_id, member_id]
    );
    if (assignemnetCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member is not assigned." });
    }

    const getMetrics = await pool.query(`SELECT * FROM metrics`);
    const metrics = getMetrics.rows;

    const availableMetrics = metrics.map((metric) => metric.metrics_id);
    console.log("🚀 ~ availableMetrics:", availableMetrics);

    const requestMetrics = metricsArray.map((metric) => metric.metrics_id);
    console.log("🚀 ~ requestMetrics:", requestMetrics);

    const sortedAvailableMetrics = availableMetrics.sort((a, b) => a - b);
    const sortedRequestMetrics = requestMetrics.sort((a, b) => a - b);

    // Check if both sorted arrays are equal
    const areEqual =
      JSON.stringify(sortedAvailableMetrics) ===
      JSON.stringify(sortedRequestMetrics);

    if (!areEqual) {
      return res
        .status(400)
        .json({ message: "Grades for all metrics required." });
    }

    await client.query("BEGIN");

    const evaluationResult = await client.query(
      `INSERT INTO evaluations (trainer_id, member_id, note) VALUES ($1, $2, $3) RETURNING *`,
      [trainer_id, member_id, note]
    );
    const evaluation = evaluationResult.rows[0];
    const evaluation_id = evaluation.evaluation_id;

    await Promise.all(
      metricsArray.map(async (grade) => {
        const metricCheck = await client.query(
          `SELECT * FROM metrics WHERE metrics_id = $1`,
          [grade.metrics_id]
        );

        if (metricCheck.rowCount <= 0) {
          return res
            .status(404)
            .json({ message: "The requested metric was not found." });
        }

        const validGrades = ["A", "B", "C", "D", "E", "F"];
        if (!validGrades.includes(grade.grade)) {
          return res.status(400).json({ message: "Invalid grade received." });
        }

        await client.query(
          "INSERT INTO metric_evaluation (metrics_id, evaluation_id, grade) VALUES ($1, $2, $3)",
          [grade.metrics_id, evaluation_id, grade.grade]
        );
      })
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "Evaluation saved successfully" });
  } catch (error) {
    await client.query(`ROLLBACK`);
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get all metrics
router.get("/metrics", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM metrics`);
    const metrics = result.rows;
    return res.status(200).json(metrics);
  } catch (error) {
    console.log("🚀 ~ gymRoute.js /metrics error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/metrics/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const nameCheck = await pool.query(
      `SELECT * FROM metrics WHERE LOWER(metric_name) LIKE LOWER('%' || $1 || '%')`,
      [name]
    );
    console.log("🚀 ~ nameCheck:", nameCheck.rows);

    if (nameCheck.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "A metric with that name already exists." });
    }

    await pool.query(`INSERT INTO metrics (metric_name) VALUES ($1)`, [name]);

    return res
      .status(200)
      .json({ message: "Metric for evaluation created successfully." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get years for report
router.get("/member/report/get-year", async (req, res) => {
  try {
    const result =
      await pool.query(`SELECT DISTINCT EXTRACT(YEAR FROM created_at) AS year
    FROM evaluations`);

    const years = result.rows;

    return res.status(200).json(years);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

// Endpoint to get report
router.get("/member/report/:id/:month/:year", async (req, res) => {
  try {
    const { id, month, year } = req.params;

    if (!id || !month || !year) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const result = await pool.query(
      `SELECT
          ev.*,
          me.grade,
          m.metric_name
      FROM
          evaluations AS ev
      JOIN
          metric_evaluation AS me ON ev.evaluation_id = me.evaluation_id
      JOIN
          metrics AS m ON me.metrics_id = m.metrics_id
      WHERE
      ev.member_id = $1
      AND EXTRACT(MONTH FROM ev.created_at) = $2
      AND EXTRACT(YEAR FROM ev.created_at) = $3`,
      [id, month, year]
    );

    const reports = result.rows;

    const gradeValues = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    const totalGradePoints = reports.reduce(
      (total, report) => total + gradeValues[report.grade],
      0
    );
    const avgGrade = totalGradePoints / reports.length;

    let grade = "";
    if (avgGrade >= 4.5) grade = "A";
    else if (avgGrade >= 3.5) grade = "B";
    else if (avgGrade >= 2.5) grade = "C";
    else if (avgGrade >= 1.5) grade = "D";
    else if (avgGrade >= 0.5) grade = "E";
    else grade = "F";

    return res.status(200).json({ reports, grade });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint to generate member code
router.get("/member/code/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id]
    );
    if (userCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "The requested member was not found.",
      });
    }

    const memberCode = crypto.randomInt(1000000);

    await pool.query(`UPDATE users SET member_code = $1 WHERE user_id = $2`, [
      memberCode,
      id,
    ]);

    return res.status(200).json(memberCode);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res.status(500).json({
      message: "Internal server error. Try again later.",
    });
  }
});

router.post("/member/activate", async (req, res) => {
  try {
    const { code, user_id } = req.body;

    if (!code || !user_id) {
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
    const user = userCheck.rows[0];
    const memberCode = user.member_code;

    if (code !== memberCode) {
      return res.status(400).json({ message: "Incorrect code. Try again." });
    }

    const token = jwt.sign({ user: user }, process.env.SECRET_KEY);

    return res
      .status(200)
      .json({ message: "Coverted to member successfully.", token: token });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/exercise/recommendations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const member = memberCheck.rows[0];
    const expiry_date = new Date(member.expiry_date);
    const current_date = new Date();

    expiry_date.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const isActive = current_date < expiry_date;

    if (!isActive) {
      return res.status(401).json({
        message: "Membership expired. Please renew to view recommendations.",
      });
    }

    const recommendationCheck = await pool.query(
      `SELECT * FROM recommendations WHERE member_id = $1 AND recommendation_type = 'exercise' ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    const recommendation_id = recommendationCheck.rows[0].recommendation_id;

    const result = await pool.query(
      `SELECT * FROM recommended_exercises WHERE recommendation_id = $1`,
      [recommendation_id]
    );
    const exercises = result.rows;

    return res.status(200).json(exercises);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/meal/recommendations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const member = memberCheck.rows[0];
    const expiry_date = new Date(member.expiry_date);
    const current_date = new Date();

    expiry_date.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const isActive = current_date < expiry_date;

    if (!isActive) {
      return res.status(401).json({
        message: "Membership expired. Please renew to view recommendations.",
      });
    }

    const recommendationCheck = await pool.query(
      `SELECT * FROM recommendations WHERE member_id = $1 AND recommendation_type = 'meal' ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (recommendationCheck.rowCount <= 0) {
      return res.status(200).json([]);
    }

    const recommendation_id = recommendationCheck.rows[0].recommendation_id;

    const result = await pool.query(
      `SELECT * FROM recommended_recipes WHERE recommendation_id = $1`,
      [recommendation_id]
    );
    const meals = result.rows;

    return res.status(200).json(meals);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/exercise/bodyPart/recommendations/:id/:part", async (req, res) => {
  try {
    const { id, part } = req.params;

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [id]
    );
    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const member = memberCheck.rows[0];
    const expiry_date = new Date(member.expiry_date);
    const current_date = new Date();

    expiry_date.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const isActive = current_date < expiry_date;

    if (!isActive) {
      return res.status(401).json({
        message: "Membership expired. Please renew to view recommendations.",
      });
    }

    const recommendationCheck = await pool.query(
      `SELECT * FROM recommendations WHERE member_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (recommendationCheck.rowCount <= 0) {
      return res.status(200).json([]);
    }

    const recommendation_id = recommendationCheck.rows[0].recommendation_id;

    const result = await pool.query(
      `SELECT * FROM recommended_exercises WHERE recommendation_id = $1 AND body_part = $2`,
      [recommendation_id, part]
    );
    const exercises = result.rows;

    return res.status(200).json(exercises);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/exercise/recommend", async (req, res) => {
  const client = await pool.connect();
  try {
    const { member_id } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    if (!member_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [member_id]
    );

    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const member = memberCheck.rows[0];
    const expiry_date = new Date(member.expiry_date);
    const current_date = new Date();
    expiry_date.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const isActive = current_date < expiry_date;

    if (!isActive) {
      return res.status(401).json({
        message: "Membership expired. Please renew to get recommendations.",
      });
    }

    const requestCheck = await pool.query(
      `SELECT member_id, COUNT(*) AS requests 
    FROM recommendations 
    WHERE EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM created_at) 
    AND member_id = $1
    AND recommendation_type = 'exercise'
    GROUP BY member_id`,
      [member_id]
    );

    if (requestCheck.rowCount !== 0) {
      const requestsArray = requestCheck.rows[0];
      const requests = requestsArray.requests;

      if (requests > 3) {
        return res
          .status(429)
          .json({ message: "To many requests received. Try again later." });
      }
    }

    const bodyPartList = [
      "back",
      "shoulders",
      "chest",
      "cardio",
      "upper arms",
      "upper legs",
    ];

    const recommendations = {
      back: [],
      shoulders: [],
      chest: [],
      cardio: [],
      "upper arms": [],
      "upper legs": [],
    };

    const userCheck = await pool.query(
      `SELECT weight_goal
      FROM users
      JOIN members ON users.user_id = members.user_id
      WHERE member_id = $1`,
      [member_id]
    );

    if (userCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "Account not found. Please create an account to continue.",
      });
    }
    const userGoal = userCheck.rows[0].weight_goal;

    await client.query(`BEGIN`);

    const result = await client.query(
      `INSERT INTO recommendations (member_id, recommendation_type, goal) VALUES ($1, $2, $3) RETURNING *`,
      [member_id, "exercise", userGoal]
    );

    const recommendation_id = result.rows[0].recommendation_id;

    for (const part of bodyPartList) {
      const split = part.split(" ");

      let query = part;
      if (split.length > 1) {
        query = split.join("%20");
      }

      let offset = 20;
      if (part === "chest" || part === "back" || part === "shoulders") {
        offset = 100;
      }

      const randomOffset = Math.floor(Math.random() * offset) + 1;

      const options = {
        method: "GET",
        url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${query}`,
        params: {
          limit: "30",
          offset: randomOffset.toString(),
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_EXERCISE_HOST,
        },
      };

      const response = await axios.request(options);
      recommendations[part] = shuffleArray(response.data).slice(0, 10);

      for (const exercise of recommendations[part]) {
        await client.query(
          `INSERT INTO recommended_exercises (recommendation_id, name, body_part, equipment, image, target, secondary_muscles, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            recommendation_id,
            exercise.name,
            exercise.bodyPart,
            exercise.equipment,
            exercise.gifUrl,
            exercise.target,
            exercise.secondaryMuscles,
            exercise.instructions,
          ]
        );
      }
    }

    await client.query(`COMMIT`);

    return res.status(200).json({ message: "New recommendations generated." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    await client.query(`ROLLBACK`);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/meal/recommend", async (req, res) => {
  const client = await pool.connect();
  try {
    const { member_id } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    if (!member_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE member_id = $1`,
      [member_id]
    );

    if (memberCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested member was not found." });
    }

    const member = memberCheck.rows[0];
    const expiry_date = new Date(member.expiry_date);
    const current_date = new Date();
    expiry_date.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const isActive = current_date < expiry_date;

    if (!isActive) {
      return res.status(401).json({
        message: "Membership expired. Please renew to get recommendations.",
      });
    }

    const requestCheck = await pool.query(
      `SELECT member_id, COUNT(*) AS requests 
    FROM recommendations 
    WHERE EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM created_at) 
    AND member_id = $1
    AND recommendation_type = 'meal'
    GROUP BY member_id`,
      [member_id]
    );

    if (requestCheck.rowCount !== 0) {
      const requestsArray = requestCheck.rows[0];
      const requests = requestsArray.requests;

      if (requests > 3) {
        return res
          .status(400)
          .json({ message: "To many requests received. Try again later." });
      }
    }

    const mealType = ["breakfast", "lunch", "dinner"];

    const recommendations = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };

    const userCheck = await pool.query(
      `SELECT calorie_intake, weight_goal
      FROM users
      JOIN members ON users.user_id = members.user_id
      WHERE member_id = $1`,
      [member_id]
    );

    if (userCheck.rowCount <= 0) {
      return res.status(404).json({
        message: "Account not found. Please create an account to continue.",
      });
    }
    const user = userCheck.rows[0];
    const userGoal = user.weight_goal;
    const userCalorie = user.calorie_intake;

    const breakfastCalorie = (1 / 6) * userCalorie;

    const lunchCalorie = (3 / 6) * userCalorie;

    const dinnerCalorie = (2 / 6) * userCalorie;

    await client.query(`BEGIN`);

    const result = await client.query(
      `INSERT INTO recommendations (member_id, recommendation_type, goal) VALUES ($1, $2, $3) RETURNING *`,
      [member_id, "meal", userGoal]
    );

    const recommendation_id = result.rows[0].recommendation_id;

    const breakfastOptions = [
      "Biscuits and cookies",
      "Bread",
      "Drinks",
      "Egg",
      "Omelet",
      "Pancake",
      "Sandwiches",
      "Salad",
    ];

    for (const meal of mealType) {
      let mealTypes = ["Main course"];
      let dietType = "high-protein";

      if (meal === "breakfast") {
        mealTypes = breakfastOptions;
        dietType = "balanced";
      }

      let calories;
      if (meal === "breakfast") {
        calories = breakfastCalorie;
      } else if (meal === "lunch") {
        calories = lunchCalorie;
      } else {
        calories = dinnerCalorie;
      }

      const options = {
        method: "GET",
        url: "https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2",
        params: {
          type: "public",
          "field[0]": "uri",
          beta: "true",
          time: "1+",
          random: "true",
          calories: `${calories - 100}-${calories}`,
          health: "alcohol-free",
          mealType: mealTypes,
          diet: `${dietType}`,
        },
        headers: {
          "Accept-Language": "en",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_RECIPE_HOST,
        },
      };

      const response = await axios.request(options);

      recommendations[meal] = shuffleArray(response.data.hits).slice(0, 7);

      for (const recipe of recommendations[meal]) {
        await client.query(
          `INSERT INTO recommended_recipes (recommendation_id, recipe_id, recipe_name, ingredients, servings, cook_time, calories, carbs, protein, fat, instruction_link, img_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            recommendation_id,
            recipe.recipe.uri.split("#")[1],
            recipe.recipe.label,
            recipe.recipe.ingredientLines,
            recipe.recipe.yield,
            recipe.recipe.totalTime,
            Math.round(recipe.recipe.calories / recipe.recipe.yield),
            Math.round(
              recipe.recipe.totalNutrients.CHOCDF.quantity / recipe.recipe.yield
            ),
            Math.round(
              recipe.recipe.totalNutrients.PROCNT.quantity / recipe.recipe.yield
            ),
            Math.round(
              recipe.recipe.totalNutrients.FAT.quantity / recipe.recipe.yield
            ),
            recipe.recipe.url,
            recipe.recipe.image,
          ]
        );
      }
    }

    await client.query(`COMMIT`);

    return res.status(200).json({ message: "New recommendations generated." });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    await client.query(`ROLLBACK`);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
