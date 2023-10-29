const mongoose = require("mongoose");
const minAllowEmpty = require("../../services/validatorAllowEmpty");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  middleName: {
    type: String,
    maxlength: 256,
    validate: {
      validator: minAllowEmpty(2),
      message: "should be empty or minimum",
    },
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 14,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 256,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  imageUrl: {
    type: String,
    maxlength: 1024,
    validate: {
      validator: minAllowEmpty(6),
      message: "should be empty or minimum",
    },
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  },
  imageAlt: {
    type: String,
    maxlength: 256,
    validate: {
      validator: minAllowEmpty(6),
      message: "should be empty or minimum",
    },
    default: "default alt",
  },
  state: {
    type: String,
    maxlength: 256,
    validate: {
      validator: minAllowEmpty(2),
      message: "should be empty or minimum",
    },
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  street: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256,
  },
  houseNumber: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 256,
  },
  zipCode: {
    type: Number,
    maxlength: 99999999,
    validate: {
      validator: minAllowEmpty(1, "number"),
      message: "should be empty or minimum",
    },
  },
  biz: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
