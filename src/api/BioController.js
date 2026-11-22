const {
  insertBio,
  getBiosBySeason,
  updateBioById,
  deleteBioById,
} = require("../services/BioService");

const createBio = async (req, res) => {
  try {
    const userData = req.body;
    const newBio = await insertBio(userData);

    return newBio;
  } catch (error) {
    console.error("Error creating bio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBios = async (req, res) => {
  try {
    const season = req.body.season;
    const bios = await getBiosBySeason(season);
    return bios;
  } catch (error) {
    console.error("Error getting all bios:", error);
    throw new Error("Failed to get bios");
  }
};

const updateBio = async (req, res) => {
  const bioId = req.params.id;
  const updates = req.body;

  const updatedBio = await updateBioById(bioId, updates);
  return updatedBio;
};

const deleteBio = async (req, res) => {
  const bioId = req.params.id;

  const deletedBio = await deleteBioById(bioId);
  return deletedBio;
};

module.exports = {
  createBio,
  getAllBios,
  updateBio,
  deleteBio,
};
