const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const dbURI = process.env.DB_URI;
const connection = mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
//kya h ye
module.exports = connection;
//wow
