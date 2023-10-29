const Joi = require("joi");

function validateRegistration(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(256).required(),
    middleName: Joi.string().min(2).max(256).allow(""),
    lastName: Joi.string().min(2).max(256).required(),
    phone: Joi.string().min(9).max(14).required(),
    email: Joi.string()
      .min(6)
      .max(256)
      .required()
      .email({ tlds: { allow: false } }),
    password: Joi.string().min(6).max(1024).required(),
    imageUrl: Joi.string().min(6).max(1024).allow(""),
    imageAlt: Joi.string().min(6).max(256).allow(""),
    state: Joi.string().min(2).max(256).allow(""),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    street: Joi.string().min(2).max(256).required(),
    houseNumber: Joi.string().min(1).max(256).required(),
    zipCode: Joi.number().min(1).max(99999999).allow(""),
    biz: Joi.boolean(),
  });

  return schema.validate(user);
}

module.exports = validateRegistration;
