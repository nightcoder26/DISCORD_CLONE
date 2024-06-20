const mongoose = require("mongoose");
const { Schema } = mongoose;

const channelSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  type: { type: String, required: true },
});

const Channel = mongoose.model("Channel", channelSchema);
module.exports = { Channel };
