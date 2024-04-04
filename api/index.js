const express = require("express");
const cors = require("cors");

const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Routes
const authRoute = require("./routes/authRoute");
const diaryRoute = require("./routes/diaryRoute");
const exerciseRoute = require("./routes/exerciseRoute");
const recipeRoute = require("./routes/recipeRoute");
const usersRoute = require("./routes/usersRoute");
const gymRoute = require("./routes/gymRoute");
const { pool } = require("./dbConfig");

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/diary", diaryRoute);
app.use("/exercise", exerciseRoute);
app.use("/recipe", recipeRoute);
app.use("/users", usersRoute);
app.use("/gym", gymRoute);

app.listen(4000, () => {
  console.log("listening on port 4000");
});

var users = {};

io.on("connection", (socket) => {
  console.log("A user is connected.", socket.id);

  socket.on("connected", (id) => {
    users[id] = socket.id;
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { user_id, id, message } = data;

      const check = await pool.query(
        `
        SELECT * FROM partners 
        WHERE (sender_id = $1 OR receiver_id = $1) 
        AND (sender_id = $2 OR receiver_id = $2)
        AND isConnected = true`,
        [user_id, id]
      );

      if (check.rowCount <= 0) {
        console.log("NOT SENT.");
        return;
      }

      const { rows } = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, sent_text) VALUES ($1, $2, $3) RETURNING *",
        [user_id, id, message]
      );

      io.emit("receiveMessage", rows[0]);

      io.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
    } catch (error) {
      console.log("🚀 ~ index.js io error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected.");
  });
});

server.listen(8000, () => {
  console.log("Socket.io server running on port 8000");
});

app.get("/messages", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;

    const messages = await pool.query(
      `
    SELECT * FROM messages 
    WHERE (sender_id = $1 OR receiver_id = $1) 
    AND (sender_id = $2 OR receiver_id = $2)
    ORDER BY sent_at DESC`,
      [sender_id, receiver_id]
    );
    return res.status(200).json(messages.rows);
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error. Try again later." });
  }
});
