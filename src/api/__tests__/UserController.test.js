jest.mock("../../services/UserService");
jest.mock("../../services/OAuthService");

const JWT = require("jsonwebtoken");
const {
  createUser,
  getUsers,
  getSpecificUser,
  destroyUser,
  getLoggedInUser,
} = require("../UserController");
const { createNewUser, getAllUsers, deleteUserByUsername } = require("../../services/UserService");
const { getUserByGoogleUserId } = require("../../services/OAuthService");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController.createUser", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("createUser: returns 401 when req.user is not set", async () => {
    const req = { user: undefined };
    const res = mockRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No authorization token provided" });
    expect(createNewUser).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("createUser: creates the user and sends it back on success", async () => {
    const user = { sub: "google-sub-123", email: "user@example.com" };
    const req = { user };
    const res = mockRes();
    const persistedUser = { _id: "abc123", ...user };
    createNewUser.mockResolvedValue(persistedUser);

    await createUser(req, res);

    expect(createNewUser).toHaveBeenCalledWith(user);
    expect(res.send).toHaveBeenCalledWith(persistedUser);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("createUser: returns 500 and logs the error when createNewUser throws", async () => {
    const user = { sub: "google-sub-123" };
    const req = { user };
    const res = mockRes();
    createNewUser.mockRejectedValue(new Error("db down"));

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create user",
      details: "db down",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error creating user:", expect.any(Error));
  });
});

describe("UserController.getUsers", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("getUsers: sends the list of all users on success", async () => {
    const users = [{ sub: "google-sub-123" }, { sub: "google-sub-456" }];
    getAllUsers.mockResolvedValue(users);
    const req = {};
    const res = mockRes();

    await getUsers(req, res);

    expect(res.send).toHaveBeenCalledWith(users);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("getUsers: returns 500 and logs the error when getAllUsers throws", async () => {
    getAllUsers.mockRejectedValue(new Error("db down"));
    const req = {};
    const res = mockRes();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to get users",
      details: "db down",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting users:", expect.any(Error));
  });
});

describe("UserController.getSpecificUser", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("getSpecificUser: looks up the user by req.userId and sends it back", async () => {
    const user = { sub: "google-sub-123", email: "user@example.com" };
    getUserByGoogleUserId.mockResolvedValue(user);
    const req = { userId: "google-sub-123" };
    const res = mockRes();

    await getSpecificUser(req, res);

    expect(getUserByGoogleUserId).toHaveBeenCalledWith("google-sub-123");
    expect(res.send).toHaveBeenCalledWith(user);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("getSpecificUser: returns 500 and logs the error when the lookup throws", async () => {
    getUserByGoogleUserId.mockRejectedValue(new Error("db down"));
    const req = { userId: "google-sub-123" };
    const res = mockRes();

    await getSpecificUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to get user",
      details: "db down",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting specific user:", expect.any(Error));
  });
});

describe("UserController.destroyUser", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("destroyUser: deletes the user identified by req.params.username and sends it back", async () => {
    const deletedUser = { sub: "google-sub-123" };
    deleteUserByUsername.mockResolvedValue(deletedUser);
    const req = { params: { username: "google-sub-123" } };
    const res = mockRes();

    await destroyUser(req, res);

    expect(deleteUserByUsername).toHaveBeenCalledWith("google-sub-123");
    expect(res.send).toHaveBeenCalledWith(deletedUser);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("destroyUser: returns 500 and logs the error when deletion throws", async () => {
    deleteUserByUsername.mockRejectedValue(new Error("db down"));
    const req = { params: { username: "google-sub-123" } };
    const res = mockRes();

    await destroyUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to delete user",
      details: "db down",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting user:", expect.any(Error));
  });
});

describe("UserController.getLoggedInUser", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("getLoggedInUser: returns the user matching the sub encoded in the token cookie", async () => {
    const token = JWT.sign({ sub: "google-sub-123" }, process.env.JWT_SECRET);
    const req = { cookies: { token } };
    const res = mockRes();

    const expectedUser = { sub: "google-sub-123", email: "user@example.com" };
    getUserByGoogleUserId.mockResolvedValue(expectedUser);

    const result = await getLoggedInUser(req, res);

    expect(getUserByGoogleUserId).toHaveBeenCalledWith("google-sub-123");
    expect(result).toEqual(expectedUser);
    expect(res.status).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("getLoggedInUser: does not send a duplicate response and instead sends a 500 when the token is invalid", async () => {
    const req = { cookies: { token: "not-a-real-token" } };
    const res = mockRes();

    const result = await getLoggedInUser(req, res);

    expect(result).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Failed to get user" }),
    );
    expect(getUserByGoogleUserId).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting logged-in user:", expect.any(Error));
  });
});
