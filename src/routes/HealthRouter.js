const express = require("express");
const { readHealth, writeHealth, ping } = require("../api/HealthController");
const HealthRouter = express.Router();

HealthRouter.get("/ping", ping);
HealthRouter.get("/", readHealth);
HealthRouter.post("/", writeHealth);

module.exports = HealthRouter;
