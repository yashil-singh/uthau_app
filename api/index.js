const express = require("express");
const cors = require("cors");

const app = express();

// Routes
const authRoute = require("./routes/authRoute");
const diaryRoute = require("./routes/diaryRoute");

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/diary", diaryRoute);

app.listen(4000, () => {
  console.log("listening on port 4000");
});
