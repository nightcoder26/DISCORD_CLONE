const { Message } = require("../models/messageModel");
const { Channel } = require("../models/channelModel");
const mongoose = require("mongoose");
const messageController = {
  addMessageFirst: async (req, res) => {
    try {
      const { channelName, messages } = req.body;
      const newMessage = new Message({ channelName, messages });
      await newMessage.save();
      res.status(201).json({ newMessage });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }, //yes dono krra wo logic lagao tum merko nhi ara
  //
  addMessage: async (req, res) => {
    const { channelName, username, text } = req.body;

    try {
      // Find the channel by channelName in the Message model
      const channel = await Message.findOne({ channelName });

      // If the channel is not found, return a 404 status
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      // Create a new message object
      const newMessage = { username, text };

      // Add the new message to the messages array
      channel.messages.push(newMessage);

      // Save the updated channel document
      await channel.save();

      // Return the updated channel document
      res.status(200).json(channel);
    } catch (error) {
      // Handle any errors that occur
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = messageController;
