const mongoose = require("mongoose");
const { Schema } = mongoose;
const { Channel } = require("./channelModel");
const serverSchema = new Schema({
  serverName: { type: String, unique: true, required: true },
  categories: [
    {
      categoryName: { type: String, required: true },
      channels: [Channel.schema],
    },
  ],
});
// ek kaam krskte h channel ko alag model bnake yha le askte h

const Server = mongoose.model("Server", serverSchema);
module.exports = { Server };
