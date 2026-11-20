const User = require("../models/user");
const { getGooglePayload, signLocalJWT } = require("../util/auth");
const { createNewUser } = require("../services/UserService");
require("dotenv").config();

const loginWithGoogle = async (req, res) => {
  const { sub, email, name, picture, email_verified } = await getGooglePayload(req, res);
  if (!email_verified) {
    return res.status(401).json({ error: "Email not verified" });
  }
  const user = { sub, email, name, picture };
  req.user = user; // Attach user info to request for downstream middleware
  const newUser = await createNewUser(user); // Create user in the database if not exists
  await signLocalJWT(req, res); // Sign JWT and set cookie

  res.status(200).json({ user: newUser, message: "User authenticated and JWT issued" });
}

module.exports = {
  loginWithGoogle,
};
