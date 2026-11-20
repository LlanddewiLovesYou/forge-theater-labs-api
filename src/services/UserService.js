const JWT = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const getAccessToken = async (user) => {
  const accessToken = await JWT.sign(user, process.env.GOOGLE_CLIENT_SECRET, {
    expiresIn: "1h",
  });
  return accessToken;
};

const createNewUser = async (userData) => {
  const newUser = await User.findOneAndUpdate({ sub: userData.sub }, userData, {
    upsert: true,
    returnDocument: "after",
  });
  return newUser;
};

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getUserByUsername = async (userName) => {
  const users = await User.find({ userName: userName });
  return users;
};

const deleteUserByUsername = async (userName) => {
  const user = User.find({ _id: userName });
  await user.deleteMany({ _id: userName });
  return user[0];
};

module.exports = {
  createNewUser,
  getAccessToken,
  getAllUsers,
  getUserByUsername,
  deleteUserByUsername,
};
