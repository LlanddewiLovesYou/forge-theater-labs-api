jest.mock("../../api/BioController");

const express = require("express");
const request = require("supertest");

const BioRouter = require("../BioRouter");
const { createBio, getAllBios, updateBio, deleteBio } = require("../../api/BioController");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/bios", BioRouter);
  return app;
};

describe("BioRouter integration", () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    app = buildApp();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("GET /bios", () => {
    it("BioRouter GET /bios: returns 200 with the bios from getAllBios", async () => {
      const bios = [{ name: "Angie Nixon", season: "2" }];
      getAllBios.mockResolvedValue(bios);

      const response = await request(app).get("/bios");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(bios);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("BioRouter GET /bios: returns 500 and logs the error when getAllBios throws", async () => {
      getAllBios.mockRejectedValue(new Error("Failed to get bios"));

      const response = await request(app).get("/bios");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in BioRouter GET /:", expect.any(Error));
    });
  });

  describe("POST /bios", () => {
    it("BioRouter POST /bios: returns 400 when name or copy is missing from the body", async () => {
      const response = await request(app).post("/bios").send({ copy: "lorem ipsum" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Name and copy are required" });
      expect(createBio).not.toHaveBeenCalled();
    });

    it("BioRouter POST /bios: creates the bio and returns 201 with the created document", async () => {
      const payload = { name: "Angie Nixon", copy: "lorem ipsum", season: "2" };
      const createdBio = { _id: "bio-id-123", ...payload };
      createBio.mockResolvedValue(createdBio);

      const response = await request(app).post("/bios").send(payload);

      expect(createBio).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdBio);
    });
  });

  describe("PATCH /bios/:id", () => {
    it("BioRouter PATCH /bios/:id: updates the bio and returns 200 with the updated document", async () => {
      const updates = { name: "new guy", copy: "THIS IS SOME NEW COPY", season: "1" };
      const updatedBio = { _id: "bio-id-123", ...updates };
      updateBio.mockResolvedValue(updatedBio);

      const response = await request(app).patch("/bios/bio-id-123").send(updates);

      expect(updateBio).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedBio);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("BioRouter PATCH /bios/:id: returns 500 and logs the error when updateBio throws", async () => {
      updateBio.mockRejectedValue(new Error("db down"));

      const response = await request(app).patch("/bios/bio-id-123").send({ name: "x" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in BioRouter PATCH `/:id` :",
        expect.any(Error),
      );
    });
  });

  describe("DELETE /bios/:id", () => {
    it("BioRouter DELETE /bios/:id: deletes the bio and returns 200 with the deleted document", async () => {
      const deletedBio = { _id: "bio-id-123", name: "Angie Nixon" };
      deleteBio.mockResolvedValue(deletedBio);

      const response = await request(app).delete("/bios/bio-id-123");

      expect(deleteBio).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(deletedBio);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("BioRouter DELETE /bios/:id: returns 500 and logs the error when deleteBio throws", async () => {
      deleteBio.mockRejectedValue(new Error("db down"));

      const response = await request(app).delete("/bios/bio-id-123");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        " Error in BioRouterDELETE `/:id` :",
        expect.any(Error),
      );
    });
  });
});
