const express = require("express");
const { getLoggedInUser } = require("../api/UserController");
const { requireAuthMiddleware } = require("../middleware");
const { loginWithGoogle } = require("../api/OAuthController");

const OAuthRouter = express.Router();

OAuthRouter.post("/google", async (req, res) => {
  try {
    await loginWithGoogle(req, res);
  } catch (error) {
    console.error("Error during Google OAuth:", error);
    res.status(401).json({ error: "Invalid Google Token" });
  }
});

OAuthRouter.get("/me", requireAuthMiddleware, async (req, res) => {
  const user = await getLoggedInUser(req, res);
  if (res.headersSent) {
    return;
  }
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ user });
});

OAuthRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = OAuthRouter;
