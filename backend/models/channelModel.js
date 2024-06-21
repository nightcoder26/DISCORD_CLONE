const mongoose = require("mongoose");
const { Schema } = mongoose;

const channelSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  type: { type: String, required: true },
});
//iske lie pehle channel ka ek krna h uske baad ye resolve easily hojaiga . abhi channel table empty h na
//no table hee empty h

const Channel = mongoose.model("Channel", channelSchema);
module.exports = { Channel };
