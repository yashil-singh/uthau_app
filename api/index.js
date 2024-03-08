const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());

app.listen(4000, () => {
  console.log("listening on port 4000");
});
