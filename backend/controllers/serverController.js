const { Server } = require("../models/serverModel");
const mongoose = require("mongoose");
const { UserServer } = require("../models/userServerModel");
const { User } = require("../models/userModel");
const serverController = {
  createServer: async (req, res) => {
    try {
      const { serverName, categories } = req.body;
      const server = new Server({ serverName, categories });
      await server.save();
      res.status(201).json({ server });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  joinServer: async (req, res) => {
    try {
      const { serverName } = req.body;
      const { username } = req.body;
      const server = await Server.findOne({ serverName: serverName });
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      //yha server valid ya nhi check kr rha
      //user nhi hora
      //wo userserver check krra
      //normal users me check krna h
      //yes
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // res.status(200).json({ server });
      // // response servers database se bhej rha
      // it says ki findOne function me callback nhi deni
      const userServer = UserServer.findOne({ username: req.body.username });
      if (!userServer) {
        //yha create krna h
        //kaise krte
        UserServer.create({ username: req.body.username, servers: [] });
      }
      //ig idk
      userServer.servers.push(serverName);

      //ye dekho
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = serverController;
