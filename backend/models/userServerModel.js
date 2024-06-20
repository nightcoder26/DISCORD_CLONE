const mongoose = require("mongoose");
const { Schema } = mongoose;

const userServerSchema = new Schema({
  username: { type: String, required: true },
  servers: { type: [String], required: true, default: [] },
});

const UserServer = mongoose.model("UserServer", userServerSchema);
module.exports = { UserServer };

//local storage
