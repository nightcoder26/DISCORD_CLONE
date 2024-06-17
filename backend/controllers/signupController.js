const { User } = require("../models/userModel");
const mongoose = require("mongoose");

const signupController = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    const user = await User.create({ username, email, password, displayName });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).send("user not created");
  }
};

module.exports = signupController;
