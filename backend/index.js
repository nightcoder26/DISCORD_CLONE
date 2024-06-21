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
const { User } = require("./models/userModel");
const userRoute = require("./routes/userRoute");
const serverRoute = require("./routes/serverRoute");
const messageRoute = require("./routes/messageRoute");
const channelRoute = require("./routes/channelRoute");
const { Message } = require("./models/messageModel");
const { Server } = require("./models/serverModel");

const port = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.listen(port, () => {
  console.log("Server is running on port 6000");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userRoute);
app.use("/server", serverRoute);
app.use("/message", messageRoute);
app.use("/channel", channelRoute);

//chordete isko for now lets do models
