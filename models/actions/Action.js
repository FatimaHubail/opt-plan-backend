const mongoose = require("mongoose")
const { Schema } = mongoose
const { metricSchema } = require("../MetricSchema")
const { REQUEST_STATUSES } = require("../constants/RequestStatus")

const ACTION_STATUSES = ["not_started", "in_progress", "completed"]

const actionSchema = new Schema(
  {
    objectiveId: {
      type: Schema.Types.ObjectId,
      ref: "Objective",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },

    totalWeight: { type: metricSchema, default: () => ({}) },
    totalAchievement: { type: metricSchema, default: () => ({}) },

    mainEntity: { type: String, default: "", trim: true },
    supportingEntities: { type: String, default: "" },
    humanResources: { type: String, default: "" },
    financialResources: { type: String, default: "" },

    actionContributionPercentage: {
      type: metricSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ACTION_STATUSES,
      default: "not_started",
    },

    notes: { type: String, default: "" },

    proposedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requestStatus: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "draft",
    },

    sortOrder: { type: Number, default: 0 },

    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "ActionVersion",
      default: null,
    },
  },
  { timestamps: true }
)

actionSchema.index({ objectiveId: 1, sortOrder: 1 })
actionSchema.index({ proposedByUserId: 1, requestStatus: 1 })
actionSchema.index({ status: 1 })

module.exports = mongoose.model("Action", actionSchema)
module.exports.REQUEST_STATUSES = REQUEST_STATUSES
module.exports.ACTION_STATUSES = ACTION_STATUSES