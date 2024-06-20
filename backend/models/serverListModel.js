const mongoose = require("mongoose");
const { Schema } = mongoose;

const serverListSchema = new Schema({
  servers: { type: [String], required: true, default: ["abc"] },
});

const ServerList = mongoose.model("ServerList", serverListSchema);
module.exports = { ServerList };

//local storage
