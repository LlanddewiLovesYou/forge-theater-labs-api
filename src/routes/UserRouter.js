const express = require("express");
const {
  getUsers,
  getSpecificUser,
  destroyUser,
  createUser,
} = require("../api/UserController");
const { requireAuthMiddleware } = require("../middleware");
const { checkPermissions } = require("../util/permissions");

const UserRouter = express.Router();

UserRouter.post("/", requireAuthMiddleware, createUser);
UserRouter.get("/", requireAuthMiddleware, checkPermissions("admin"), getUsers);
UserRouter.get("/:sub", requireAuthMiddleware, getSpecificUser);
UserRouter.delete(
  "/:username",
  requireAuthMiddleware,
  checkPermissions("admin"),
  destroyUser,
);

module.exports = UserRouter;
