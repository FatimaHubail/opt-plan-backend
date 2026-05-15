const mongoose = require("mongoose")
const { Schema } = mongoose

const planVersionSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endYear: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

planVersionSchema.index({ isActive: 1 })

module.exports = mongoose.model("PlanVersion", planVersionSchema)