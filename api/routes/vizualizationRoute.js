const express = require("express");
const router = express.Router();
const { pool } = require("../dbConfig");

router.get("/memberactivity/:year", async (req, res) => {
  try {
    const { year } = req.params;

    let query = year;

    if (!year) {
      query = new Date().getFullYear;
    }

    const yearCheck = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM joined_date) as years FROM members`
    );
    const years = yearCheck.rows;

    const result = await pool.query(
      `SELECT EXTRACT(MONTH FROM joined_date) AS month, TO_CHAR(joined_date, 'Month') AS month_name, COUNT(member_id) AS member_count
      FROM members
      WHERE EXTRACT(YEAR FROM joined_date) = $1
      GROUP BY month_name, month
      ORDER BY month ASC`,
      [query]
    );

    const data = result.rows;

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/revenue/:year", async (req, res) => {
  try {
    const { year } = req.params;

    let query = year;

    if (!year) {
      query = new Date().getFullYear();
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/revenue/current/week", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT payment_type, 
COALESCE(SUM(CASE WHEN date >= DATE_TRUNC('week', CURRENT_DATE)
AND date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
THEN payment_amount ELSE 0 END), 0) AS revenue
FROM payments 
WHERE status = 'Completed'
GROUP BY payment_type`);

    const data = result.rows;
    console.log("🚀 ~ data:", data);

    return res.status(200).json(data);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/transaction/latest/:rows", async (req, res) => {
  try {
    const { rows } = req.params;

    let noOfRows = rows;
    if (!rows) {
      noOfRows = 5;
    }

    const result = await pool.query(
      `SELECT p.*, u.user_id, m. member_id, u.name AS user, m.name AS member  FROM payments p
        LEFT JOIN members m ON m.member_id = p.member_id
        LEFT JOIN users u ON u.user_id = p.user_id
        ORDER BY p.date DESC
        LIMIT $1`,
      [noOfRows]
    );

    const transactions = result.rows;

    return res.status(200).json(transactions);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
