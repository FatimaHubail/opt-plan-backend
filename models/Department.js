const mongoose = require("mongoose")
const { Schema } = mongoose

const departmentSchema = new Schema(
  {
    planVersionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanVersion",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

departmentSchema.index({ planVersionId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model("Department", departmentSchema)