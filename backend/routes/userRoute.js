//suggestions nhi ara

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

const loginController = require("../controllers/loginController");
// const signupController = require("../controllers/signupController");
const signupController = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    console.log(username, email, password, displayName);
    // const newUser = new User({ username, email, password, displayName });
    // const user = await newUser.save();
    //using insertOne()
    const user = await new User({
      username,
      email,
      password,
      displayName,
    }).save();
    //kya yar ye itna time leti
    //okay i'll try tho aj poora
    //hn
    res.status(201).json({ user });
  } catch (error) {
    //ye create nhi horha tha na user

    console.error("Error creating user:", error);
    res.status(500).send("User not created. Error: " + error.message);
  }
};

router.post("/login", loginController);
router.post("/signup", signupController);
module.exports = router;
