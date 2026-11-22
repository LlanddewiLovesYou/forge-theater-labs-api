const JWT = require("jsonwebtoken");
const { requireAuthMiddleware } = require("../index");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("requireAuthMiddleware", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("requireAuthMiddleware: returns 401 when no token cookie is present", async () => {
    const req = { cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("requireAuthMiddleware: returns 401 when the token is invalid or expired", async () => {
    const req = { cookies: { token: "not-a-real-token" } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ valid: false, error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Token verification error:", expect.any(Error));
  });

  it("requireAuthMiddleware: returns 401 when the token signature does not match JWT_SECRET", async () => {
    const tokenSignedWithWrongSecret = JWT.sign({ sub: "google-sub-123" }, "wrong-secret");
    const req = { cookies: { token: tokenSignedWithWrongSecret } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Token verification error:", expect.any(Error));
  });

  it("requireAuthMiddleware: sets req.userId and calls next() for a valid token", async () => {
    const validToken = JWT.sign({ sub: "google-sub-123" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const req = { cookies: { token: validToken } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuthMiddleware(req, res, next);

    expect(req.userId).toBe("google-sub-123");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
