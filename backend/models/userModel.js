//suggestion nhi ara
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  displayName: {
    type: String,
    required: [true, "Please provide a display name"],
  },
});

//krna h yha bcrypt?

const User = mongoose.model("User", userSchema);
module.exports = User;
