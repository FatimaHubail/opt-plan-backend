const mongoose = require("mongoose")
const { Schema } = mongoose

const objectiveVersionSchema = new Schema(
  {
    objectiveId: { type: Schema.Types.ObjectId, ref: "Objective", required: true },
    version: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed, required: true }, // full copy of fields at that time
    submittedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

objectiveVersionSchema.index({ objectiveId: 1, version: 1 }, { unique: true })

module.exports = mongoose.model("ObjectiveVersion", objectiveVersionSchema)