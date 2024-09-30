const express = require("express");
const Chat = require("../model/chats/chatModel");
const User = require("../model/users/userModel");
const normalizeChat = require("../model/chats/NormalizeChat");

const router = express.Router();

// GET route to retrieve chat history between two users
router.get("/history", async (req, res) => {
  const { roomID } = req.query;

  try {
    const messages = await Chat.find({ roomID }).sort("timestamp");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving chat history" });
  }
});

router.get("/activeChats", async (req, res) => {
  const userID = req.query.userID;

  try {
    // Fetches all the chats where the connected user is a participant
    const chats = await Chat.find({
      $or: [{ senderID: userID }, { recepientID: userID }],
    }).sort({ timestamp: -1 });

    // Group chats by the other user and keep only the most recent chat
    const activeChats = {};
    for (const chat of chats) {
      const otherUserID =
        String(chat.senderID) === String(userID)
          ? chat.recepientID
          : chat.senderID;
      const contentPrefix =
        String(chat.recepientID) === String(userID) ? "You: " : "";

      if (!(String(otherUserID) in activeChats)) {
        const otherUserDetails = await User.findById(otherUserID);

        activeChats[String(otherUserID)] = {
          otherUserID: otherUserID,
          otherUserName: otherUserDetails.firstName,
          lastMessage: {
            content: contentPrefix + chat.content,
            time: chat.time,
          },
        };
      }
    }

    res.json(Object.values(activeChats));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
module.exports = router;
