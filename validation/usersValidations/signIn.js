const Joi = require("joi");

function validateSignIn(req) {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(256)
      .required()
      .email({ tlds: { allow: false } }),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(req);
}

module.exports = validateSignIn;
