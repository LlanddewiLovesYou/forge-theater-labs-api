const JWT = require("jsonwebtoken");

jest.mock("google-auth-library", () => {
  const verifyIdToken = jest.fn();
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken,
    })),
    __mockVerifyIdToken: verifyIdToken,
  };
});

const { OAuth2Client } = require("google-auth-library");
const { getGooglePayload, signLocalJWT } = require("../auth");

const mockRes = () => {
  const res = {};
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth util - getGooglePayload", () => {
  it("getGooglePayload: verifies the Google ID token and returns its payload", async () => {
    const fakePayload = { sub: "google-sub-123", email: "user@example.com" };
    const clientInstance = new OAuth2Client();
    clientInstance.verifyIdToken.mockResolvedValue({
      getPayload: () => fakePayload,
    });

    const req = { body: { credential: "fake-id-token" } };
    const res = mockRes();

    const payload = await getGooglePayload(req, res);

    expect(payload).toEqual(fakePayload);
    expect(clientInstance.verifyIdToken).toHaveBeenCalledWith({
      idToken: "fake-id-token",
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  });

  it("getGooglePayload: propagates errors thrown while verifying the token", async () => {
    const clientInstance = new OAuth2Client();
    clientInstance.verifyIdToken.mockRejectedValue(new Error("Token used too late"));

    const req = { body: { credential: "expired-token" } };
    const res = mockRes();

    await expect(getGooglePayload(req, res)).rejects.toThrow("Token used too late");
  });
});

describe("auth util - signLocalJWT", () => {
  it("signLocalJWT: signs a JWT with the request user and sets it as an httpOnly cookie", async () => {
    const user = { sub: "google-sub-123", email: "user@example.com" };
    const req = { user };
    const res = mockRes();

    await signLocalJWT(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(1);
    const [cookieName, token, options] = res.cookie.mock.calls[0];

    expect(cookieName).toBe("token");
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
    });

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject(user);
  });

  it("signLocalJWT: sets secure cookie flag only in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const req = { user: { sub: "google-sub-123" } };
    const res = mockRes();

    await signLocalJWT(req, res);

    const [, , options] = res.cookie.mock.calls[0];
    expect(options.secure).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });
});
