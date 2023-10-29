const validateRegistration = require("../validation/usersValidations/registraion");
const validateEditUser = require("../validation/usersValidations/editUser");
const validateSignin = require("../validation/usersValidations/signIn");
const { comparePassword, generateHashPassword } = require("../services/bcrypt");
const { generateAuthToken } = require("../services/token");
const _ = require("lodash");
const router = require("express").Router();
const User = require("../model/users/userModel");
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
    console.log(chalk.redBright("Invalid email"));
    return res.status(400).send("Invalid email or password.");
  }

  const validPassword = comparePassword(req.body.password, user.password);
  if (!validPassword) {
    console.log(chalk.redBright("Invalid password"));
    return res.status(400).send("Invalid email or password.");
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
    console.log(err);
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
