//loginController.js
const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");
const loginController = async (req, res) => {
  try {
    //ab yha kya krna h ,
  } catch (error) {
    res.status(500).send("user not found");
  }
};
module.exports = loginController;
