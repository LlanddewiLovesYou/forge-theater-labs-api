const Health = require('../models/health');

const getHealthWrites = async () => {
  const writes = await Health.find();
  return writes;
};

const writeToHealthTable = async (body) => {
  const newWrite = new Health(body);
  await newWrite.save();
  return newWrite;
};

module.exports = {
  getHealthWrites,
  writeToHealthTable,
};