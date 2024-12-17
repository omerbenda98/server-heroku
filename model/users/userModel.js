const mongoose = require("mongoose");
const minAllowEmpty = require("../../services/validatorAllowEmpty");

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'adoption_request', 'adoption_confirmed'
  message: { type: String, required: true },
  data: {
    dogId: { type: mongoose.Schema.Types.ObjectId, ref: "card" },
    dogName: String,
    dogBreed: String,
    dogAge: String,
    dogImageUrl: String,
    adopterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adopterName: String,
    adopterEmail: String,
    adopterPhone: String,
    adopterFirstName: String,
    adopterLastName: String,
    originalOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestDate: Date,
    formData: mongoose.Schema.Types.Mixed,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const adoptionRequestSchema = new mongoose.Schema({
  originalOwner: {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String, // Original owner's name
  },
  dog: {
    dogId: { type: mongoose.Schema.Types.ObjectId, ref: "card" },
    name: String,
    breed: String,
    age: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
});

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
  notifications: [notificationSchema],
  requests_sent: [adoptionRequestSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
