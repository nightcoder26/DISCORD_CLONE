//suggestions nhi ara

const express = require("express");
const router = express.Router();
const { Message } = require("../models/messageModel");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

const messageController = require("../controllers/messageController");

router.post("/addMessageModel", messageController.addMessageFirst);
router.post("/addMessage", messageController.addMessage);
// router.post("/deleteMessage", messageController.deleteMessage);
module.exports = router;
