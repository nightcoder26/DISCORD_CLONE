const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  channelName: { type: String, unique: true, required: true },
  //id manrhe name ko abhi ke lie
  // 2 kind of add message configure krenge . ek pehli baar ke lie , ek after that
  // wo abhi krna h?
  messages: [
    {
      username: { type: String, required: true },
      text: { type: String, required: true },
    },
    //is this correct? or should it be like
    //channelnme: { username : { type: String, required: true }, text: { type: String, required: true }
  ], //aisa chihye?
  //or this
  //kyu
  //oooooooo
  //next kya thi
  //isme thode problems h terko dikh rha?
  //nhi i g
});

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };

//deeply seekhna h tho sql me krna h whi mongoose ke alwa sql se krna h//haa fir bhi ye krna bhi sql me tough hoga
