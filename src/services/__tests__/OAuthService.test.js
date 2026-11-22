jest.mock("../../models/user");

const User = require("../../models/user");
const { getUserByGoogleUserId, getUserDataFromGoogle } = require("../OAuthService");

describe("OAuthService.getUserByGoogleUserId", () => {
  it("getUserByGoogleUserId: returns the first user matching the given sub", async () => {
    const user = { sub: "google-sub-123", email: "user@example.com" };
    User.find = jest.fn().mockResolvedValue([user]);

    const result = await getUserByGoogleUserId("google-sub-123");

    expect(User.find).toHaveBeenCalledWith({ sub: "google-sub-123" });
    expect(result).toEqual(user);
  });

  it("getUserByGoogleUserId: returns undefined when no user matches the sub", async () => {
    User.find = jest.fn().mockResolvedValue([]);

    const result = await getUserByGoogleUserId("missing-sub");

    expect(result).toBeUndefined();
  });
});

describe("OAuthService.getUserDataFromGoogle", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("getUserDataFromGoogle: fetches and returns the Google userinfo payload for the access token", async () => {
    const userInfo = { sub: "google-sub-123", email: "user@example.com" };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(userInfo),
    });

    const result = await getUserDataFromGoogle("fake-access-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=fake-access-token",
    );
    expect(result).toEqual(userInfo);
  });

  it("getUserDataFromGoogle: propagates errors thrown by fetch", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network error"));

    await expect(getUserDataFromGoogle("fake-access-token")).rejects.toThrow("network error");
  });
});
