const mongoose = require("mongoose")
const { Schema } = mongoose

const reviewSchema = new Schema(
  {
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },

    /** Groups a single auditor review pass (1st request, 2nd after resubmit, …) */
    reviewRound: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    auditorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /** Schema/API field key, e.g. targetValue, executionIndicatorDescription, title */
    field: {
      type: String,
      required: true,
      trim: true,
    },

    /** What the auditor wants changed (ReviewObjective “note” per field) */
    requestedChange: {
      type: String,
      required: true,
      trim: true,
    },

    /** Only on one row per round, or use a separate flag — see general notes below */
    isGeneralNotes: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

requestedEditSchema.index({ proposalId: 1, reviewRound: 1, field: 1 })
// Prevent duplicate field requests in same round
requestedEditSchema.index(
  { proposalId: 1, reviewRound: 1, field: 1, isGeneralNotes: 1 },
  { unique: true, partialFilterExpression: { isGeneralNotes: false } }
)

module.exports = mongoose.model("Review", reviewSchema)