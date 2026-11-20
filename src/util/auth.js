const { OAuth2Client } = require("google-auth-library");
const JWT = require("jsonwebtoken");
require("dotenv").config();

const getGooglePayload = async (req, res) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage",
  );

  const ticket = await oAuth2Client.verifyIdToken({
    idToken: req.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

const signLocalJWT = async (req, res) => {
  const accessToken = await JWT.sign(req.user, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set to true in production
    sameSite: "lax",
    maxAge: 3600000, // 1 hour
  });
};

module.exports = { getGooglePayload, signLocalJWT };
