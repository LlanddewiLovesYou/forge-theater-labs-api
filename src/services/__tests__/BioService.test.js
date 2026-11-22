jest.mock("../../models/bio");

const Bio = require("../../models/bio");
const { insertBio, getBiosBySeason, updateBioById, deleteBioById } = require("../BioService");

describe("BioService.insertBio", () => {
  it("insertBio: creates a bio and returns its plain document data", async () => {
    const userData = { name: "Angie Nixon", copy: "lorem ipsum", season: "2" };
    const createdDoc = { _doc: { _id: "abc123", ...userData } };
    Bio.create = jest.fn().mockResolvedValue(createdDoc);

    const result = await insertBio(userData);

    expect(Bio.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(createdDoc._doc);
  });

  it("insertBio: propagates errors from Bio.create", async () => {
    Bio.create = jest.fn().mockRejectedValue(new Error("db down"));

    await expect(insertBio({ name: "x", copy: "y", season: "1" })).rejects.toThrow("db down");
  });
});

describe("BioService.getBiosBySeason", () => {
  it("getBiosBySeason: returns only bios matching the given season when provided", async () => {
    const allBios = [
      { name: "A", season: "1" },
      { name: "B", season: "2" },
      { name: "C", season: "2" },
    ];
    Bio.find = jest.fn().mockResolvedValue(allBios);

    const result = await getBiosBySeason("2");

    expect(Bio.find).toHaveBeenCalledWith();
    expect(result).toEqual([allBios[1], allBios[2]]);
  });

  it("getBiosBySeason: groups all bios by season when no season is provided", async () => {
    const allBios = [
      { name: "A", season: "0" },
      { name: "B", season: "1" },
      { name: "C", season: "1" },
    ];
    Bio.find = jest.fn().mockResolvedValue(allBios);

    const result = await getBiosBySeason(undefined);

    expect(result).toEqual({
      0: [allBios[0]],
      1: [allBios[1], allBios[2]],
    });
  });

  it("getBiosBySeason: propagates errors from Bio.find", async () => {
    Bio.find = jest.fn().mockRejectedValue(new Error("db down"));

    await expect(getBiosBySeason("1")).rejects.toThrow("db down");
  });
});

describe("BioService.updateBioById", () => {
  it("updateBioById: updates the bio matching bioId with the given fields and returns the updated document", async () => {
    const updates = { name: "new guy", copy: "THIS IS SOME NEW COPY", season: "1" };
    const updatedBio = { _id: "bio-id-123", ...updates };
    Bio.findOneAndUpdate = jest.fn().mockResolvedValue(updatedBio);

    const result = await updateBioById("bio-id-123", updates);

    expect(Bio.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bio-id-123" },
      { $set: { ...updates } },
      { new: true },
    );
    expect(result).toEqual(updatedBio);
  });

  it("updateBioById: propagates errors from Bio.findOneAndUpdate", async () => {
    Bio.findOneAndUpdate = jest.fn().mockRejectedValue(new Error("db down"));

    await expect(updateBioById("bio-id-123", { name: "x" })).rejects.toThrow("db down");
  });
});

describe("BioService.deleteBioById", () => {
  it("deleteBioById: deletes the bio matching bioId and returns the deletion result", async () => {
    const deletedBio = { _id: "bio-id-123", name: "Angie Nixon" };
    Bio.findOneAndDelete = jest.fn().mockResolvedValue(deletedBio);

    const result = await deleteBioById("bio-id-123");

    expect(Bio.findOneAndDelete).toHaveBeenCalledWith({ _id: "bio-id-123" }, { new: true });
    expect(result).toEqual(deletedBio);
  });

  it("deleteBioById: propagates errors from Bio.findOneAndDelete", async () => {
    Bio.findOneAndDelete = jest.fn().mockRejectedValue(new Error("db down"));

    await expect(deleteBioById("bio-id-123")).rejects.toThrow("db down");
  });
});
