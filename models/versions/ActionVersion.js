const mongoose = require("mongoose")
const { Schema } = mongoose

const actionVersionSchema = new Schema(
  {
    actionId: { type: Schema.Types.ObjectId, ref: "Action", required: true },
    version: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    submittedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

actionVersionSchema.index({ actionId: 1, version: 1 }, { unique: true })

module.exports = mongoose.model("ActionVersion", actionVersionSchema)