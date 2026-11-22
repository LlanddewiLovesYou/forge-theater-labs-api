const Bio = require("../models/bio");

const insertBio = async (userData) => {
  const newBio = await Bio.create(userData);

  return newBio._doc;
};

const getBiosBySeason = async (seasonParam) => {
  const allBios = await Bio.find();

  if (seasonParam) {
    return allBios.filter((bio) => bio.season === seasonParam);
  }

  const latestSeason = allBios.map((bio) => bio.season).sort((a, b) => b - a)[0];

  const bios = {};

  let currentSeason = 0;

  while (currentSeason <= latestSeason) {
    const currentSeasonBios = allBios.filter((bio) => bio.season === currentSeason.toString());
    bios[currentSeason] = currentSeasonBios;
    currentSeason++;
  }

  return bios;
};

const updateBioById = async (bioId, updates) => {
  const updatedBio = await Bio.findOneAndUpdate(
    { _id: bioId }, // 1. Filter criteria
    { $set: { ...updates } }, // 2. Update operations
    { new: true }, // 3. Optional settings
  );

  return updatedBio;
};

const deleteBioById = async (bioId) => {
  const deletedBio = Bio.findOneAndDelete({ _id: bioId }, { new: true });

  return deletedBio;
};

module.exports = { insertBio, getBiosBySeason, updateBioById, deleteBioById };
