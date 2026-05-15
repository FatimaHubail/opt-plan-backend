const mongoose = require("mongoose")
const { Schema } = mongoose
const { metricSchema } = require("../MetricSchema")
const { REQUEST_STATUSES } = require("../constants/RequestStatus")

const taskSchema = new Schema(
  {
    actionId: {
      type: Schema.Types.ObjectId,
      ref: "Action",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    weight: { type: metricSchema, default: () => ({}) },

    startDate: { type: Date, default: null },
    expectedEndDate: { type: Date, default: null },

    performanceIndicators: { type: String, default: "" },
    targetValue: { type: metricSchema, default: () => ({}) },
    actualValueAchieved: { type: String, default: "" },
    achievementPercentage: { type: metricSchema, default: () => ({}) },

    requestStatus: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
    },

    sortOrder: { type: Number, default: 0 },

    currentVersionId: {
      type: Schema.Types.ObjectId,
      ref: "TaskVersion",
      default: null,
    },
  },
  { timestamps: true }
)

taskSchema.index({ actionId: 1, sortOrder: 1 })
taskSchema.index({ requestStatus: 1 })

module.exports = mongoose.model("Task", taskSchema)