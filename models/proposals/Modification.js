const mongoose = require("mongoose")
const { Schema } = mongoose

const modificationSchema = new Schema(
  {
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
      index: true,
    },

    reviewRound: {
      type: Number,
      required: true,
      min: 1,
    },

    /** Links to the auditor request this answers (optional but useful) */
    requestedEditId: {
      type: Schema.Types.ObjectId,
      ref: "RequestedEdit",
      default: null,
    },

    field: {
      type: String,
      required: true,
      trim: true,
    },

    updatedValue: {
      type: Schema.Types.Mixed,
      required: true,
    },

    editedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    editedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

modificationSchema.index({ proposalId: 1, reviewRound: 1, field: 1 })
modificationSchema.index({ requestedEditId: 1 })

module.exports = mongoose.model("Modification", modificationSchema)