const { Message } = require("../models/messageModel");
const mongoose = require("mongoose");
const messageController = {
  addMessage: async (req, res) => {
    try {
      const { channelName, messages } = req.body;
      const newMessage = new Message({ channelName, messages });
      await newMessage.save();
      res.status(201).json({ newMessage });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //are delete kaise krenge if there is no id for message?  bro
};
