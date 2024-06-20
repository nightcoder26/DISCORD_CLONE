const mongoose = require("mongoose");
const { Schema } = mongoose;

const userServerSchema = new Schema({
  username: { type: String, required: true },
  servers: { type: Array, required: true },
});

const UserServer = mongoose.model("UserServer", userServerSchema);
module.exports = { UserServer };

//isko test krna h
//dinner baad dekhte h
//jao
//bye bye
