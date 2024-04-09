const express = require("express");
const { pool } = require("../dbConfig");
const router = express.Router();
var request = require("request");
const axios = require("axios");

router.post("/initialize", async (req, res) => {
  try {
    const { user_id, order_name, amount } = req.body;
    console.log("🚀 ~ initialize req.body:", req.body);

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

    const createOrder = await pool.query(
      `
        INSERT INTO payments (user_id, payment_amount, remarks)
        VALUES ($1, $2, $3) RETURNING *`,
      [user_id, amount, order_name]
    );

    const order = createOrder.rows[0];
    const order_id = order.payment_id;

    var options = {
      method: "POST",
      url: "https://a.khalti.com/api/v2/epayment/initiate/",
      headers: {
        Authorization: process.env.KHALTI_SECRECT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: "http://192.168.101.2:4000/payment/callback",
        website_url: "http://192.168.101.2:4000/payment/success",
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
      return res.status(400).json({ message: "Payment not completed." });
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
        `UPDATE payments SET status = $1 WHERE payment_id = $2`,
        [status, purchase_order_id]
      );
      return res.status(400).json({ message: "Payment not completed." });
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
