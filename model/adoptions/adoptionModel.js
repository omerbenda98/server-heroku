const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema({
  // Adoption details
  adoptionDate: {
    type: Date,
    default: Date.now,
    required: true,
  },

  // Dog information
  dog: {
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
      required: true,
    },
    name: String,
    breed: String,
    age: String,
    imageUrl: String,
  },

  // Adopter information
  adopter: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },

  // Original owner information
  originalOwner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },

  // Additional adoption details
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed",
  },

  notes: {
    type: String,
    maxlength: 1024,
  },
});

const Adoption = mongoose.model("Adoption", adoptionSchema);

module.exports = Adoption;
