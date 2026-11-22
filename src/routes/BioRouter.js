const express = require("express");
const { createBio, getAllBios, updateBio, deleteBio } = require("../api/BioController");

const BioRouter = express.Router();

BioRouter.get("/", async (req, res) => {
  try {
    const bios = await getAllBios(req, res);
    res.status(200).json(bios);
  } catch (error) {
    console.error("Error in BioRouter GET /:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

BioRouter.post("/", async (req, res) => {
  const { name, copy } = req.body;
  if (!name || !copy) {
    return res.status(400).json({ error: "Name and copy are required" });
  }
  const bio = await createBio(req, res);
  res.status(201).json({ ...bio});
})

BioRouter.patch("/:id", async (req, res) => {
  try {
    const updatedBio = await updateBio(req, res)
    res.status(200).json(updatedBio)
  } catch (error) {
    console.error("Error in BioRouter PATCH `/:id` :", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

BioRouter.delete("/:id", async (req, res) => {
  try {
    const deletedBio = await deleteBio(req, res)
    res.status(200).json(deletedBio)
  } catch (error) {
    console.error(" Error in BioRouterDELETE `/:id` :", error)
    res.status(500).json({ error: "Internal server error" })
  }
})


module.exports = BioRouter
