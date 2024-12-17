const express = require("express");
const router = express.Router();
const Adoption = require("../model/adoptions/adoptionModel");
const Card = require("../model/cards/cardModel");
const User = require("../model/users/userModel");
const auth = require("../middlewares/authorization");

// Accept adoption request
router.post("/accept-request", auth, async (req, res) => {
  try {
    const { notificationId, originalOwnerId } = req.body;

    // Verify the notification exists and hasn't been processed
    const originalOwner = await User.findById(originalOwnerId);
    const notification = originalOwner.notifications.id(notificationId);

    if (!notification || notification.type !== "adoption_request") {
      return res.status(404).json({
        message: "Invalid notification or already processed",
      });
    }

    const notificationData = notification.data;

    // Create new adoption record using the data from the notification
    const adoption = new Adoption({
      dog: {
        dogId: notificationData.dogId,
        name: notificationData.dogName,
        breed: notificationData.dogBreed,
        age: notificationData.dogAge,
        imageUrl: notificationData.dogImageUrl,
      },
      adopter: {
        userId: notificationData.adopterId,
        firstName: notificationData.adopterFirstName,
        lastName: notificationData.adopterLastName,
        email: notificationData.adopterEmail,
        phone: notificationData.adopterPhone,
      },
      originalOwner: {
        userId: notificationData.originalOwnerId,
        firstName: originalOwner.firstName,
        lastName: originalOwner.lastName,
        email: originalOwner.email,
        phone: originalOwner.phone,
      },
    });

    await adoption.save();

    // Update the dog's status
    await Card.findByIdAndUpdate(notificationData.dogId, { adopted: true });

    // Send confirmation notifications to both parties
    const adoptionConfirmation = {
      type: "adoption_confirmed",
      message: `Adoption confirmed for ${notificationData.dogName}`,
      data: {
        adoptionId: adoption._id,
        dogName: notificationData.dogName,
        adoptionDate: adoption.adoptionDate,
        dogId: notificationData.dogId,
      },
    };

    // Mark the original request notification as read
    notification.read = true;

    // Add confirmation notifications to both parties
    const adopter = await User.findById(notificationData.adopterId);
    adopter.notifications.push(adoptionConfirmation);
    originalOwner.notifications.push(adoptionConfirmation);

    await Promise.all([adopter.save(), originalOwner.save()]);

    res.status(201).json({
      message: "Adoption request accepted and recorded successfully",
      adoptionId: adoption._id,
    });
  } catch (error) {
    console.error("Error in accept-adoption:", error);
    res.status(500).json({
      message: "Error accepting adoption request",
      error: error.message,
    });
  }
});

// Add this test route
router.get("/test", (req, res) => {
  res.json({ message: "Adoption router is working" });
});

module.exports = router;
