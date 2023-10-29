const User = require("./userModel");

const registerUser = (userData) => {
  const user = new User(userData);
  return user.save();
};

const getUserByEmail = (email) => {
  return User.findOne({ email });
};

const getAllUsers = () => {
  return User.find();
};

module.exports = {
  registerUser,
  getUserByEmail,
  getAllUsers,
};
