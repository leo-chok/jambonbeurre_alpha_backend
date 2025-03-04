const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  message: String,
  date: Date,
  sender: String,
});

const conversationSchema = mongoose.Schema({
  users: [String],
  title: String,
  messages: [messageSchema],
});

const Conversation = mongoose.model("chats", conversationSchema);


module.exports = Conversation;