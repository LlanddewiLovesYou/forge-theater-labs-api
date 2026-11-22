jest.mock("../../api/OAuthController");
jest.mock("../../api/UserController", () => {
  const actual = jest.requireActual("../../api/UserController");
  return {
    ...actual,
    getLoggedInUser: jest.fn(),
  };
});

const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");
const JWT = require("jsonwebtoken");

const OAuthRouter = require("../OAuthRouter");
const { loginWithGoogle } = require("../../api/OAuthController");
const { getLoggedInUser } = require("../../api/UserController");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/auth", OAuthRouter);
  return app;
};

describe("OAuthRouter integration", () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    app = buildApp();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("POST /auth/google", () => {
    it("OAuthRouter POST /auth/google: delegates to loginWithGoogle and returns its response", async () => {
      loginWithGoogle.mockImplementation(async (req, res) => {
        res.status(200).json({ user: { sub: "google-sub-123" }, message: "ok" });
      });

      const response = await request(app)
        .post("/auth/google")
        .send({ credential: "fake-credential" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: { sub: "google-sub-123" },
        message: "ok",
      });
      expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    });

    it("OAuthRouter POST /auth/google: returns 401 when loginWithGoogle throws", async () => {
      loginWithGoogle.mockRejectedValue(new Error("Invalid Google Token"));

      const response = await request(app)
        .post("/auth/google")
        .send({ credential: "bad-credential" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid Google Token" });
    });
  });

  describe("GET /auth/me", () => {
    it("OAuthRouter GET /auth/me: returns 401 when no auth cookie is present", async () => {
      const response = await request(app).get("/auth/me");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "No token provided" });
      expect(getLoggedInUser).not.toHaveBeenCalled();
    });

    it("OAuthRouter GET /auth/me: returns 401 when the auth cookie contains an invalid token", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", ["token=not-a-real-token"]);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ valid: false, error: "Invalid token" });
      expect(getLoggedInUser).not.toHaveBeenCalled();
    });

    it("OAuthRouter GET /auth/me: returns 404 when the token is valid but no user is found", async () => {
      const validToken = JWT.sign({ sub: "google-sub-123" }, process.env.JWT_SECRET);
      getLoggedInUser.mockResolvedValue(undefined);

      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`token=${validToken}`]);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });

    it("OAuthRouter GET /auth/me: returns 200 with the user when the token is valid and the user exists", async () => {
      const validToken = JWT.sign({ sub: "google-sub-123" }, process.env.JWT_SECRET);
      const user = { sub: "google-sub-123", email: "user@example.com" };
      getLoggedInUser.mockResolvedValue(user);

      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`token=${validToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ user });
    });

    it("OAuthRouter GET /auth/me: does not send a second response when getLoggedInUser already sent one", async () => {
      const validToken = JWT.sign({ sub: "google-sub-123" }, process.env.JWT_SECRET);
      getLoggedInUser.mockImplementation(async (req, res) => {
        res.status(500).json({ error: "Failed to get user", details: "boom" });
        return undefined;
      });

      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", [`token=${validToken}`]);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to get user", details: "boom" });
    });
  });

  describe("POST /auth/auth/logout", () => {
    it("OAuthRouter POST /auth/auth/logout: clears the token cookie and returns a success message", async () => {
      const response = await request(app).post("/auth/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged out successfully" });

      const setCookieHeader = response.headers["set-cookie"];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader.some((c) => c.startsWith("token=;"))).toBe(true);
    });
  });
});
