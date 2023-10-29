const Joi = require("joi");

function validateCard(card) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(256).required(),
    age: Joi.string().min(1).max(256).required(),
    breed: Joi.string().min(2).max(256).required(),
    description: Joi.string().min(2).max(1024).required(),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    phone: Joi.string().min(9).max(14).required(),
    email: Joi.string()
      .min(6)
      .max(256)
      .required()
      .email({ tlds: { allow: false } }),

    imageUrl: Joi.string().min(6).max(1024).allow(""),
  });
  return schema.validate(card);
}

exports.validateCard = validateCard;
