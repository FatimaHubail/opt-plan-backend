const mongoose = require("mongoose")
const { Schema } = mongoose
const { REQUEST_STATUSES } = require("../constants/RequestStatus")

const PROPOSAL_TYPES = ["objective", "action", "task"]

const proposalSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: PROPOSAL_TYPES,
      required: true,
      index: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    targetModel: {
      type: String,
      enum: ["Objective", "Action", "Task"],
      required: true,
    },

    planSectionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanSection",
      required: true,
      index: true,
    },

    objectiveId: {
      type: Schema.Types.ObjectId,
      ref: "Objective",
      default: null,
      index: true,
    },

    actionId: {
      type: Schema.Types.ObjectId,
      ref: "Action",
      default: null,
      index: true,
    },

    submittedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "draft",
      index: true,
    },

    assignedAuditorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

proposalSchema.pre("validate", function (next) {
  if (this.type && !this.targetModel) {
    this.targetModel =
      this.type === "objective" ? "Objective" : this.type === "action" ? "Action" : "Task"
  }
  next()
})

proposalSchema.index({ submittedByUserId: 1, status: 1, updatedAt: -1 })
proposalSchema.index({ status: 1, type: 1, updatedAt: -1 })

module.exports = mongoose.model("Proposal", proposalSchema)
module.exports.PROPOSAL_TYPES = PROPOSAL_TYPES