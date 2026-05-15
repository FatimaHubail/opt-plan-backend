const mongoose = require("mongoose")
const { Schema } = mongoose

const metricSchema = new Schema(
  {
    value: { type: Number, default: null },
    unit: { type: String, enum: ["percent", "count"], default: "percent" },
    display: { type: String, default: "" },
  },
  { _id: false }
)

module.exports = { metricSchema }