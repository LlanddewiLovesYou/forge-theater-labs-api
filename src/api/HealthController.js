const { getHealthWrites, writeToHealthTable } = require("../services/HealthService");

const ping = (req, res) => {
  console.log("ping");
  console.log(req.body);
  res.status(200).json({ status: "ok" });
}

const readHealth = async (req, res) => {
  const body = req.body;
  const results = await getHealthWrites(body);
  console.log("results", results);

  return res.status(200).send(results)
}

const writeHealth = async (req, res) => {
  const body = req.body;
  const write = await writeToHealthTable(body);
  console.log("write", write);
  return res.status(200).send(write);
}

module.exports = {
  ping,
  readHealth,
  writeHealth,
};