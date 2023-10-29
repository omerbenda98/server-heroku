const Joi = require("joi");

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid Object Id");

const validateObjectId = (id) => {
  const schema = Joi.object({
    id: objectId.required(),
  });
  return schema.validate({ id });
};

module.exports = validateObjectId;
