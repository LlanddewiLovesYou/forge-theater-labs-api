const mongoose = require("mongoose");

const bioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    copy: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Bio = mongoose.model("bio", bioSchema);

module.exports = Bio;