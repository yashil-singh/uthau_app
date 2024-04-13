const express = require("express");
const { pool } = require("../dbConfig");
const router = express.Router();
var request = require("request");
const axios = require("axios");

router.post("/competition", async (req, res) => {
  const client = await pool.connect();

  try {
    const { fitness_competition_id, user_id, amount, order_name } = req.body;

    if (!user_id || !order_name || !amount) {
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

    await client.query(`BEGIN`);

    const createOrder = await pool.query(
      `
        INSERT INTO payments (user_id, payment_amount, remarks)
        VALUES ($1, $2, $3) RETURNING *`,
      [user_id, amount, order_name]
    );
    const order = createOrder.rows[0];
    const order_id = order.payment_id;

    await pool.query(
      `INSERT INTO comp_participants (fitness_competition_id, payment_id) VALUES ($1, $2)`,
      [fitness_competition_id, order_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ order_id });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/membership", async (req, res) => {
  const client = await pool.connect();

  try {
    const { plan_id, user_id } = req.body;

    if (!plan_id || !user_id) {
      return res.status(400).json({ message: "Invalid request." });
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
    const oldRole = user.role;

    if (oldRole === "member") {
      return res.status(400).json({
        message: "Invalid request. The requested user is already a member.",
      });
    }

    const plan = planCheck.rows[0];
    const amount = 100;
    const duration = plan.duration;
    const order_name = `${duration} month(s) Membership`;

    await client.query(`BEGIN`);

    const createOrder = await pool.query(
      `
        INSERT INTO payments (user_id, payment_amount, remarks)
        VALUES ($1, $2, $3) RETURNING *`,
      [user_id, amount, order_name]
    );

    const order = createOrder.rows[0];

    const order_id = order.payment_id;

    await pool.query(
      `INSERT INTO membership_transactions (user_id, plan_id, payment_id) VALUES ($1, $2, $3)`,
      [user_id, plan_id, order_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ order_id });
  } catch (error) {
    client.query(`ROLLBACK`);
    console.log("🚀 ~ /payment/membership error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.post("/initialize", async (req, res) => {
  try {
    const { order_id } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    if (!order_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const orderCheck = await pool.query(
      `SELECT * FROM payments WHERE payment_id = $1`,
      [order_id]
    );
    if (orderCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested order was not found." });
    }

    const order = orderCheck.rows[0];
    const amount = order.payment_amount;
    const order_name = order.remarks;
    const user_id = order.user_id;

    const userCheck = await pool.query(
      `SELECT name, email FROM users WHERE user_id = $1`,
      [user_id]
    );

    if (userCheck.rowCount <= 0) {
      return res
        .status(404)
        .json({ message: "The requested user was not found." });
    }

    const user = userCheck.rows[0];

    console.log(amount);
    console.log(order_id);
    console.log(order_name);
    console.log(user.name);
    console.log(user.email);

    var options = {
      method: "POST",
      url: "https://a.khalti.com/api/v2/epayment/initiate/",
      headers: {
        Authorization: process.env.KHALTI_SECRECT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: "http://192.168.101.10:4000/payment/callback",
        website_url: "http://192.168.101.10:4000/payment/success",
        amount: amount * 100,
        purchase_order_id: order_id,
        purchase_order_name: order_name,
        customer_info: {
          name: user.name,
          email: user.email,
        },
      }),
    };

    request(options, function (error, response) {
      const data = JSON.parse(response.body);
      console.log("🚀 ~ initialize response data:", data);

      if (data.error_key) {
        return res.status(400).send({
          message:
            "Your request couldn't be completed at the moment. Please try again later.",
        });
      }

      if (error) throw new Error(error);
      return res.status(200).json({
        url: data.payment_url,
      });
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

router.get("/callback", async (req, res) => {
  try {
    const { pidx, status, transaction_id, purchase_order_id } = req.query;
    console.log("🚀 ~ req.query:", req.query);

    if (status === "User canceled") {
      await pool.query(
        `UPDATE payments SET status = $1 WHERE payment_id = $2`,
        [status, purchase_order_id]
      );
      return res.send(
        `
          <div style="height: 100vh; display: flex; justify-content:center; align-items: center">
          <h1 style="color: red; text-align: center">Payment Not completed! You can close this window or go back now.</h1>
          </div>
      `
      );
    }

    const headers = {
      Authorization: process.env.KHALTI_SECRECT_KEY,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers }
    );

    console.log("Callback lookup response", response.data);

    if (response.data.status !== "Completed") {
      await pool.query(
        `UPDATE payments SET status = $1, payment_type =  WHERE payment_id = $2`,
        [status, purchase_order_id]
      );
      return res.send(
        `
          <div style="height: 100vh; display: flex; justify-content:center; align-items: center">
          <h1 style="color: red">Payment Not completed! You can close this window or go back now.</h1>
          </div>
      `
      );
    }

    await pool.query(
      `UPDATE payments SET status = $1, payment_service_id = $2, payment_type = 'khalti' WHERE payment_id = $3 `,
      [status, transaction_id, purchase_order_id]
    );

    return res.send(
      `
        <div style="height: 100vh; display: flex; justify-content:center; align-items: center">
        <h1 style="color: #42ba96">Payment completed! You can close this window or go back now.</h1>
        </div>
    `
    );
  } catch (error) {
    console.log("🚀 ~ error:", error?.message);
    return res
      .status(500)
      .json({ message: "Internal server error. Try again later." });
  }
});

module.exports = router;
