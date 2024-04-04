const express = require("express");
const { pool } = require("../dbConfig");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
    const result =
      await pool.query(`SELECT f.*, COUNT(c.fitness_competition_id) AS entries  FROM fitness_competitions f
        LEFT JOIN comp_participants c ON c.fitness_competition_id = f.fitness_competition_id
        GROUP BY f.fitness_competition_id, c.fitness_competition_id
        ORDER BY f.posted_date DESC`);

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
      `SELECT f.*, COUNT(c.fitness_competition_id) AS entries  FROM fitness_competitions f
            LEFT JOIN comp_participants c ON c.fitness_competition_id = f.fitness_competition_id
            WHERE f.fitness_competition_id = $1
            GROUP BY f.fitness_competition_id, c.fitness_competition_id`,
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
    console.log("🚀 ~ id:", id);

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

    const member = result.rows;
    const member_id = member.member_id;

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
      .json({ message: "Membership created successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ gymRoute.js /member/create error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/member/convert/check", async (req, res) => {
  try {
    const { email, code, plan_id } = req.body;

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
    const member_code = user.member_code;

    if (member_code !== code) {
      return res.status(400).json({
        message: "The provided member code was incorrect. Try again.",
      });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM members WHERE user_id = $1`,
      [user_id]
    );

    if (memberCheck.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "The requested user is already a member." });
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

    const selectedPlan = planCheck.rows[0];
    const amount = selectedPlan.amount;
    return res.status(200).json({
      message: "All user details are valid.",
      amount: amount,
      plan_id: plan_id,
      user_id: user_id,
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

    return res
      .status(200)
      .json({ message: "User converted to member successfully." });
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

module.exports = router;
