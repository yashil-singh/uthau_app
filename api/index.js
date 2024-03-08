const express = require("express");
const cors = require("cors");

const app = express();

// Routes
const authRoute = require("./routes/authRoute");
const diaryRoute = require("./routes/diaryRoute");
const exerciseRoute = require("./routes/exerciseRoute");
const recipeRoute = require("./routes/recipeRoute");
const usersRoute = require("./routes/usersRoute");


// Middlewares
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/diary", diaryRoute);
app.use("/exercise", exerciseRoute);
app.use("/recipe", recipeRoute);
app.use("/users", usersRoute);

app.listen(4000, () => {
  console.log("listening on port 4000");
});
