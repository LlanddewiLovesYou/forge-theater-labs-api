jest.mock("../../models/user");

const JWT = require("jsonwebtoken");
const User = require("../../models/user");
const {
  getAccessToken,
  createNewUser,
  getAllUsers,
  getUserByUsername,
  deleteUserByUsername,
} = require("../UserService");

describe("UserService.getAccessToken", () => {
  it("getAccessToken: signs and returns a JWT containing the given user data", async () => {
    const user = { sub: "google-sub-123", email: "user@example.com" };

    const token = await getAccessToken(user);

    const decoded = JWT.verify(token, process.env.GOOGLE_CLIENT_SECRET);
    expect(decoded).toMatchObject(user);
  });
});

describe("UserService.createNewUser", () => {
  it("createNewUser: upserts the user by sub and returns the updated document", async () => {
    const userData = { sub: "google-sub-123", email: "user@example.com" };
    const upsertedUser = { _id: "abc123", ...userData };
    User.findOneAndUpdate = jest.fn().mockResolvedValue(upsertedUser);

    const result = await createNewUser(userData);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { sub: userData.sub },
      userData,
      { upsert: true, returnDocument: "after" },
    );
    expect(result).toEqual(upsertedUser);
  });

  it("createNewUser: propagates errors from the database call", async () => {
    User.findOneAndUpdate = jest.fn().mockRejectedValue(new Error("db down"));

    await expect(createNewUser({ sub: "google-sub-123" })).rejects.toThrow("db down");
  });
});

describe("UserService.getAllUsers", () => {
  it("getAllUsers: returns every user in the collection", async () => {
    const users = [{ sub: "google-sub-123" }, { sub: "google-sub-456" }];
    User.find = jest.fn().mockResolvedValue(users);

    const result = await getAllUsers();

    expect(User.find).toHaveBeenCalledWith();
    expect(result).toEqual(users);
  });
});

describe("UserService.getUserByUsername", () => {
  it("getUserByUsername: queries users by the userName field", async () => {
    const users = [{ userName: "jdoe" }];
    User.find = jest.fn().mockResolvedValue(users);

    const result = await getUserByUsername("jdoe");

    expect(User.find).toHaveBeenCalledWith({ userName: "jdoe" });
    expect(result).toEqual(users);
  });
});

describe("UserService.deleteUserByUsername", () => {
  it("deleteUserByUsername: deletes the matching user and returns the first result", async () => {
    const deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
    const foundUsers = [{ _id: "google-sub-123" }];
    foundUsers.deleteMany = deleteMany;
    User.find = jest.fn().mockReturnValue(foundUsers);

    const result = await deleteUserByUsername("google-sub-123");

    expect(User.find).toHaveBeenCalledWith({ _id: "google-sub-123" });
    expect(deleteMany).toHaveBeenCalledWith({ _id: "google-sub-123" });
    expect(result).toEqual(foundUsers[0]);
  });
});
