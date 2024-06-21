const { Channel } = require("../models/channelModel");
const mongoose = require("mongoose");
const channelController = {
  addChannel: async (req, res) => {
    try {
      const { name, id, type } = req.body;
      const newChannel = new Channel({ name, id, type });
      await newChannel.save();
      res.status(201).json({ newChannel });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
module.exports = channelController;
