const express = require("express");
const router = express.Router();
const { Server } = require("../models/serverModel");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

const serverController = require("../controllers/serverController");

router.post("/create", serverController.createServer);
router.post("/join", serverController.joinServer);
module.exports = router;
