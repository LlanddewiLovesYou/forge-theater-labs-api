const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./src/models");

require("dotenv").config();

const UserRouter = require("./src/routes/UserRouter");
const OAuthRouter = require("./src/routes/OAuthRouter");
const HealthRouter = require("./src/routes/HealthRouter");
const BioRouter = require("./src/routes/BioRouter");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/health", HealthRouter);
app.use("/users", UserRouter);
app.use("/auth", OAuthRouter);
app.use("/bios", BioRouter);

connectDb().then(() => {
  app.listen(port, "0.0.0.0", () =>
    console.log(`${process.env.PROJECT_NAME}-${process.env.NODE_ENV} is listening on port ${port}`),
  );
});
