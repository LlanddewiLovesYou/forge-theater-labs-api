const {
  getAllUsers,
  deleteUserByUsername,
  createNewUser,
} = require("../services/UserService");
const JWT = require("jsonwebtoken");
require("dotenv").config();

const { getUserByGoogleUserId } = require("../services/OAuthService");

const createUser = async (req, res) => {
  try {
    const user = req.user; // Assuming user info is attached to the request by the OAuth middleware

    if (!user) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const newUser = await createNewUser(user);
    res.send(newUser);
  } catch (e) {
    console.error("Error creating user:", e);
    res
      .status(500)
      .json({ error: "Failed to create user", details: e.message });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (e) {
    console.error("Error getting users:", e);
    res.status(500).json({ error: "Failed to get users", details: e.message });
  }
};

const getLoggedInUser = async (req, res, next) => {
  try {
    const sub = JWT.verify(req.cookies.token, process.env.JWT_SECRET).sub; // Assuming userId is set in the request by the authentication middleware
    const user = await getUserByGoogleUserId(sub);
    return user;
  } catch (e) {
    console.error("Error getting logged-in user:", e);
    res.status(500).json({ error: "Failed to get user", details: e.message });
  }
}

const getSpecificUser = async (req, res, next) => {
  try {
    const sub = req.userId; // Assuming userId is set in the request by the authentication middleware
    const user = await getUserByGoogleUserId(sub);
    res.send(user);
  } catch (e) {
    console.error("Error getting specific user:", e);
    res.status(500).json({ error: "Failed to get user", details: e.message });
  }
};

const destroyUser = async (req, res, next) => {
  try {
    const userName = req.params.username;
    const user = await deleteUserByUsername(userName);
    res.send(user);
  } catch (e) {
    console.error("Error deleting user:", e);
    res
      .status(500)
      .json({ error: "Failed to delete user", details: e.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getSpecificUser,
  destroyUser,
  getLoggedInUser,
};
