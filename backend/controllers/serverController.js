const { Server } = require("../models/serverModel");
const mongoose = require("mongoose");
const { UserServer } = require("../models/userServerModel");
const { User } = require("../models/userModel");
const { ServerList } = require("../models/serverListModel");
const serverController = {
  //yha bas create server , join server ,
  createServer: async (req, res) => {
    try {
      const { serverName, categories } = req.body;
      const server = new Server({ serverName, categories });

      await server.save();

      let serverList = await ServerList.findOne(); // Assuming there's only one document in serverList collection

      if (!serverList) {
        serverList = new ServerList();
      }

      serverList.servers.push(serverName); // Add the new serverName to the servers array
      await serverList.save();
      res.status(201).json({ server });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  joinServer: async (req, res) => {
    try {
      const { serverName } = req.body;
      const { username } = req.body;
      console.log(
        `Received request to join server: ${serverName} for user: ${username}`
      );

      const server = await Server.findOne({ serverName: serverName });
      if (!server) {
        console.log("Server not found");

        return res.status(404).json({ message: "Server not found" });
      }

      const user = await User.findOne({ username: username });
      if (!user) {
        console.log("User not found");

        return res.status(404).json({ message: "User not found" });
      }

      let userServer = await UserServer.findOne({ username });

      if (!userServer) {
        console.log("UserServer entry not found, creating new entry");
        // Create the UserServer document if it doesn't exist
        userServer = new UserServer({ username, servers: [serverName] });
      } else {
        // Check if the serverName is already in the servers array
        if (!userServer.servers.includes(serverName)) {
          console.log("Adding server to user's server list");
          userServer.servers.push(serverName);
        } else {
          console.log("Server already in user's server list");
        }
      }

      // Save the UserServer document
      await userServer.save();

      console.log("User's server list after update:", userServer.servers);
      console.log("Joined server successfully");

      return res.status(200).json({ message: "Joined server successfully" });
    } catch (error) {
      console.error("Error joining server:", error);

      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = serverController;
