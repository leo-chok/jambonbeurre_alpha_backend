const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  message: String,
  date: Date,
  idSender: {type : mongoose.Schema.Types.ObjectId, ref:'users'},
});

const conversationSchema = mongoose.Schema({
  users: [{type : mongoose.Schema.Types.ObjectId, ref:'users'}],
  title: String,
  messages: [messageSchema],
});

const Conversation = mongoose.model("chats", conversationSchema);


module.exports = Conversation;