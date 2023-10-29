const normalizeChat = (chat, senderID, recepientID) => {
  return {
    ...chat,
    roomID: chat.roomID || `${senderID}-${recepientID}`,
    senderID: senderID,
    recepientID: recepientID,
    content: chat.content.trim(),
    author: chat.author.trim(),
  };
};

module.exports = normalizeChat;
