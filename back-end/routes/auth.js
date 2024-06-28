const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const User = require("../models/userModel");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

module.exports = router;
