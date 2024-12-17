const validateRegistration = require("../validation/usersValidations/registraion");
const validateEditUser = require("../validation/usersValidations/editUser");
const validateSignin = require("../validation/usersValidations/signIn");
const { comparePassword, generateHashPassword } = require("../services/bcrypt");
const { generateAuthToken } = require("../services/token");
const _ = require("lodash");
const router = require("express").Router();
const User = require("../model/users/userModel");
const mongoose = require("mongoose");

const auth = require("../middlewares/authorization");
const chalk = require("chalk");
const normalizeUser = require("../model/users/NormalizeUser");
const validateObjectId = require("../validation/idValidation");

// creates/registers a new users
router.post("/register", async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) {
    console.log(chalk.redBright(error.details[0].message));
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    console.log(chalk.redBright("Registration Error: User already registered"));
    return res.status(400).send("User already registered.");
  }
  let userData = normalizeUser(req.body);
  user = new User({ ...userData });

  user.password = generateHashPassword(user.password);
  await user.save();
  res.send(_.pick(user, ["_id", "name", "email"]));
});

// returns a token when logging in
router.post("/login", async (req, res) => {
  const { error } = validateSignin(req.body);
  if (error) {
    console.log(chalk.redBright(error.details[0].message));
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    console.log(chalk.redBright("Invalid Email"));
    return res.status(400).send("Invalid Email or password.");
  }

  const validPassword = comparePassword(req.body.password, user.password);
  if (!validPassword) {
    console.log(chalk.redBright("Invalid password"));
    return res.status(400).send("Invalid Email or password.");
  }

  res.json({
    token: generateAuthToken(user),
  });
});

// gets all the users
router.get("/getAllUsers", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      throw "you need to be admin!";
    }
    const users = await User.find().select(["-password", "-createdAt", "-__v"]);
    res.json({ users });
  } catch (err) {
    res.status(500).send(err);
  }
});
router.get("/:userId/notifications", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
});

// Get user's sent adoption requests
router.get("/:userId/requests-sent", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate that the requesting user is authorized to view these requests
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Not authorized to view these requests",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Sort requests by date, most recent first
    const sortedRequests = user.requests_sent.sort(
      (a, b) => b.requestDate - a.requestDate
    );

    res.status(200).json({
      requests: sortedRequests,
      total: sortedRequests.length,
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({
      message: "Error fetching sent requests",
      error: error.message,
    });
  }
});

// Optional: Add an endpoint to get a specific request by ID
router.get("/:userId/requests-sent/:requestId", auth, async (req, res) => {
  try {
    const { userId, requestId } = req.params;

    // Validate that the requesting user is authorized
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Not authorized to view this request",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const request = user.requests_sent.id(requestId);
    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.status(200).json({ request });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({
      message: "Error fetching request",
      error: error.message,
    });
  }
});

router.post("/submit-adoption", async (req, res) => {
  const { formData, cardOwnerId, cardId, cardData } = req.body;
  console.log("Request body:", req.body);

  try {
    if (!mongoose.Types.ObjectId.isValid(cardOwnerId)) {
      console.log("Invalid cardOwnerId:", cardOwnerId);
      return res.status(400).json({ message: "Invalid card owner ID" });
    }

    // Find both the card owner and the adopter
    const [cardOwner, adopter] = await Promise.all([
      User.findById(cardOwnerId),
      User.findById(formData.userId),
    ]);

    if (!cardOwner) {
      console.log("Card owner not found for ID:", cardOwnerId);
      return res.status(404).json({ message: "Card owner not found" });
    }

    if (!adopter) {
      console.log("Adopter not found for ID:", formData.userId);
      return res.status(404).json({ message: "Adopter not found" });
    }

    // Validate cardData has all required properties
    if (
      !cardData.name ||
      !cardData.breed ||
      !cardData.age ||
      !cardData.imgUrl
    ) {
      return res.status(400).json({
        message: "Missing required card data properties",
        required: ["name", "breed", "age", "imgUrl"],
        received: cardData,
      });
    }

    // Create the adoption request record
    const adoptionRequest = {
      originalOwner: {
        ownerId: cardOwnerId,
        firstName: cardOwner.firstName,
        lastName: cardOwner.lastName,
      },
      dog: {
        dogId: cardId,
        name: cardData.name,
        breed: cardData.breed,
        age: cardData.age,
      },
      status: "pending",
      requestDate: new Date(),
    };

    // Add to adopter's requests_sent array
    adopter.requests_sent.push(adoptionRequest);
    console.log("card data", cardData);
    console.log("formdata", formData);

    // Create notification for card owner
    const notification = {
      type: "adoption_request",
      message: `New adoption request from ${formData.name}`,
      data: {
        dogId: cardId,
        dogName: cardData.name,
        dogBreed: cardData.breed,
        dogAge: cardData.age,
        dogImageUrl: cardData.imgUrl,
        adopterId: formData.userId,
        adopterName: formData.name,
        adopterEmail: formData.email,
        adopterPhone: formData.phone,
        adopterFirstName: formData.firstName,
        adopterLastName: formData.lastName,
        originalOwnerId: cardOwnerId,
        requestDate: new Date(),
        formData: formData,
      },
    };

    cardOwner.notifications.push(notification);

    // Save both users
    await Promise.all([cardOwner.save(), adopter.save()]);

    res.status(200).json({
      message: "Adoption application sent to card owner",
      notificationId:
        cardOwner.notifications[cardOwner.notifications.length - 1]._id,
      requestId: adopter.requests_sent[adopter.requests_sent.length - 1]._id,
    });
  } catch (error) {
    console.error("Error in submit-adoption:", error);
    res.status(500).json({
      message: "Error sending adoption application",
      error: error.message,
    });
  }
});

// gets connected users info
router.get("/userInfo", auth, (req, res) => {
  let user = req.user;
  User.findById(user._id)
    .select(["-password", "-createdAt", "-__v"])
    .then((user) => res.send(user))
    .catch((errorsFromMongoose) => res.status(500).send(errorsFromMongoose));
});

// edits connected users info
router.put("/userInfo", auth, async (req, res) => {
  try {
    const { error } = validateEditUser(req.body);
    if (error) {
      console.log(chalk.redBright(error.details[0].message));
      return res.status(400).send(error.details[0].message);
    }
    let updatedUserData = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    // After updating the user's profile, generate a new token

    const token = generateAuthToken(updatedUserData);

    // Sends the new token to the client
    res.send({
      user: updatedUserData.toObject(),
      token: { token },
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// edits specific users info
router.put("/userInfo/:id", auth, async (req, res) => {
  try {
    const { error } = validateEditUser(req.body);
    if (error) {
      console.log(chalk.redBright(error.details[0].message));
      return res.status(400).send(error.details[0].message);
    }
    if (!req.user || !req.user.isAdmin) {
      throw "you need to be admin!";
    }
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ msg: "Done" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// deletes a specific user
router.delete("/deleteUser/:id", auth, async (req, res) => {
  try {
    const { error } = validateObjectId(req.params.id);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    if (!req.user || !req.user.isAdmin) {
      throw "you need to be admin!";
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Done" });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
