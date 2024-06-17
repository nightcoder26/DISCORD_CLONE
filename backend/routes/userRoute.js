//suggestions nhi ara

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");
const loginController = require("../controllers/loginController");
const signupController = require("../controllers/signupController");
router.post("/login", loginController);
router.post("/signup", signupController);
module.exports = router;
