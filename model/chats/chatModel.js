const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  roomID: {
    type: String,
    ref: "User",
    required: true,
  },
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recepientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1024,
  },
  time: {
    type: String,
    default: Date.now,
    required: true,
  },
  author: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  timestamp: {
    type: Number,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
