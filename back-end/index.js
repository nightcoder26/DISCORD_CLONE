const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const connection = require("./db/connection");

dotenv.config();
//kya kha rha
// const User = require("./models/User");
const bcrypt = require("bcrypt");

const port = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running on port${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", require("./routes/auth"));
