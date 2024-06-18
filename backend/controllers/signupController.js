const { User } = require("../models/userModel");
const mongoose = require("mongoose");
//body parser

const signupController = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    console.log(username, email, password, displayName);
    const user = await User.create({ username, email, password, displayName });

    res.status(201).json({ user });
  } catch (error) {
    //ye create nhi horha tha na user

    console.error("Error creating user:", error);
    res.status(500).send("User not created. Error: " + error.message);
  }
};

module.exports = signupController;
