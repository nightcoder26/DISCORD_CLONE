const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

const channelController = require("../controllers/channelController");

router.post("/addChannel", channelController.addChannel);

module.exports = router;
