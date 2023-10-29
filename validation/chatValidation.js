const Joi = require("joi");

function validateChat(chat) {
  const schema = Joi.object({
    roomID: Joi.string().required(),
    senderID: Joi.string().required(),
    recepientID: Joi.string().required(),
    content: Joi.string().min(1).max(1024).required(),
    time: Joi.string().required(),
    author: Joi.string().min(2).max(256).required(),
    timestamp: Joi.number().required(),
  });
  return schema.validate(chat);
}

exports.validateChat = validateChat;
