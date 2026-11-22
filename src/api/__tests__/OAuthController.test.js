jest.mock("../../util/auth");
jest.mock("../../services/UserService");

const { loginWithGoogle } = require("../OAuthController");
const { getGooglePayload, signLocalJWT } = require("../../util/auth");
const { createNewUser } = require("../../services/UserService");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("OAuthController.loginWithGoogle", () => {
  it("loginWithGoogle: returns 401 and does not create a user when email is not verified", async () => {
    getGooglePayload.mockResolvedValue({
      sub: "google-sub-123",
      email: "user@example.com",
      name: "Test User",
      picture: "http://example.com/pic.png",
      email_verified: false,
    });

    const req = { body: { credential: "fake-credential" } };
    const res = mockRes();

    await loginWithGoogle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Email not verified" });
    expect(createNewUser).not.toHaveBeenCalled();
    expect(signLocalJWT).not.toHaveBeenCalled();
  });

  it("loginWithGoogle: creates/upserts the user, signs the JWT cookie, and returns 200 with the user", async () => {
    const payload = {
      sub: "google-sub-123",
      email: "user@example.com",
      name: "Test User",
      picture: "http://example.com/pic.png",
      email_verified: true,
    };
    getGooglePayload.mockResolvedValue(payload);

    const persistedUser = { _id: "abc123", ...payload };
    createNewUser.mockResolvedValue(persistedUser);
    signLocalJWT.mockResolvedValue(undefined);

    const req = { body: { credential: "fake-credential" } };
    const res = mockRes();

    await loginWithGoogle(req, res);

    expect(createNewUser).toHaveBeenCalledWith({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
    expect(req.user).toEqual({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
    expect(signLocalJWT).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: persistedUser,
      message: "User authenticated and JWT issued",
    });
  });

  it("loginWithGoogle: propagates errors from getGooglePayload to the caller", async () => {
    getGooglePayload.mockRejectedValue(new Error("invalid id token"));

    const req = { body: { credential: "bad-credential" } };
    const res = mockRes();

    await expect(loginWithGoogle(req, res)).rejects.toThrow("invalid id token");
    expect(createNewUser).not.toHaveBeenCalled();
    expect(signLocalJWT).not.toHaveBeenCalled();
  });
});
