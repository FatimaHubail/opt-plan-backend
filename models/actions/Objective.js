const mongoose = require("mongoose")
const { Schema } = mongoose
const { metricSchema } = require("../MetricSchema")
const { REQUEST_STATUSES } = require("../constants/RequestStatus")

const objectiveSchema = new Schema(
  {
    planSectionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanSection",
      required: true,
      index: true,
    },

    // Form: name="objective" (AddObjective.tsx)
    narrative: {
      type: String,
      required: true,
      trim: true,
    },

    // Form: regulatoryEntity (dropdown of university units)
    regulatoryEntity: {
      type: String,
      required: true,
      trim: true,
    },

    // Form: objectiveExecutionIndicator
    executionIndicator: {
      type: String,
      required: true,
      trim: true,
    },

    // Form: executionIndicatorDescription
    executionIndicatorDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // Form: indicatorOwnerWithinEntity (often a title/name, not always a User)
    indicatorOwnerText: {
      type: String,
      required: true,
      trim: true,
    },

    // Same structure as PlanSection.target (not plain string)
    target: {
      type: metricSchema,
      default: () => ({}),
    },

    // Same structure as PlanSection.achievement — keys: "2024", "2025", "2026"
    achievement: {
      type: Map,
      of: metricSchema,
      default: () => new Map(),
    },

    // UI: objectiveStatus (often derived from target vs achievement; can store for display)
    objectiveStatus: {
      type: String,
      default: "",
      trim: true,
    },

    // UI: requestStatus / proposal lifecycle
    requestStatus: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "draft",
    },

    proposedByUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

    // Order within the section (objective 1, 2, 3…)
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Points to latest approved snapshot (ObjectiveVersion — optional for v1)
    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "ObjectiveVersion",
      default: null,
    },
  },
  { timestamps: true } // createdAt, updatedAt
)

objectiveSchema.index({ planSectionId: 1, sortOrder: 1 })
objectiveSchema.index({ proposedByUserId: 1, requestStatus: 1 })

module.exports = mongoose.model("Objective", objectiveSchema)
module.exports.REQUEST_STATUSES = REQUEST_STATUSES