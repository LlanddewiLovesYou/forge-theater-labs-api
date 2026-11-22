jest.mock("../../services/BioService");

const { createBio, getAllBios, updateBio, deleteBio } = require("../BioController");
const {
  insertBio,
  getBiosBySeason,
  updateBioById,
  deleteBioById,
} = require("../../services/BioService");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("BioController.createBio", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("createBio: inserts the bio from req.body and returns it", async () => {
    const userData = { name: "Angie Nixon", copy: "lorem ipsum", season: "2" };
    const req = { body: userData };
    const res = mockRes();
    const newBio = { _id: "bio-id-123", ...userData };
    insertBio.mockResolvedValue(newBio);

    const result = await createBio(req, res);

    expect(insertBio).toHaveBeenCalledWith(userData);
    expect(result).toEqual(newBio);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("createBio: returns 500 and logs the error when insertBio throws", async () => {
    const req = { body: { name: "x", copy: "y", season: "1" } };
    const res = mockRes();
    insertBio.mockRejectedValue(new Error("db down"));

    const result = await createBio(req, res);

    expect(result).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error creating bio:", expect.any(Error));
  });
});

describe("BioController.getAllBios", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("getAllBios: fetches bios filtered by req.body.season and returns them", async () => {
    const req = { body: { season: "2" } };
    const res = mockRes();
    const bios = [{ name: "Angie Nixon", season: "2" }];
    getBiosBySeason.mockResolvedValue(bios);

    const result = await getAllBios(req, res);

    expect(getBiosBySeason).toHaveBeenCalledWith("2");
    expect(result).toEqual(bios);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("getAllBios: logs and rethrows a wrapped error when getBiosBySeason throws", async () => {
    const req = { body: {} };
    const res = mockRes();
    getBiosBySeason.mockRejectedValue(new Error("db down"));

    await expect(getAllBios(req, res)).rejects.toThrow("Failed to get bios");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting all bios:", expect.any(Error));
  });
});

describe("BioController.updateBio", () => {
  it("updateBio: updates the bio identified by req.params.id using req.body and returns it", async () => {
    const updates = { name: "new guy", copy: "THIS IS SOME NEW COPY", season: "1" };
    const req = { params: { id: "bio-id-123" }, body: updates };
    const res = mockRes();
    const updatedBio = { _id: "bio-id-123", ...updates };
    updateBioById.mockResolvedValue(updatedBio);

    const result = await updateBio(req, res);

    expect(updateBioById).toHaveBeenCalledWith("bio-id-123", updates);
    expect(result).toEqual(updatedBio);
  });

  it("updateBio: propagates errors from updateBioById to the caller", async () => {
    const req = { params: { id: "bio-id-123" }, body: { name: "x" } };
    const res = mockRes();
    updateBioById.mockRejectedValue(new Error("db down"));

    await expect(updateBio(req, res)).rejects.toThrow("db down");
  });
});

describe("BioController.deleteBio", () => {
  it("deleteBio: deletes the bio identified by req.params.id and returns the result", async () => {
    const req = { params: { id: "bio-id-123" } };
    const res = mockRes();
    const deletedBio = { _id: "bio-id-123", name: "Angie Nixon" };
    deleteBioById.mockResolvedValue(deletedBio);

    const result = await deleteBio(req, res);

    expect(deleteBioById).toHaveBeenCalledWith("bio-id-123");
    expect(result).toEqual(deletedBio);
  });

  it("deleteBio: propagates errors from deleteBioById to the caller", async () => {
    const req = { params: { id: "bio-id-123" } };
    const res = mockRes();
    deleteBioById.mockRejectedValue(new Error("db down"));

    await expect(deleteBio(req, res)).rejects.toThrow("db down");
  });
});
