const mongoose = require("mongoose")
const { Schema } = mongoose
const { metricSchema } = require("./constants/MetricSchema")

const PERSPECTIVES = ["catalysts", "enablers", "beneficiary", "stakeholders"]

const planSectionSchema = new Schema(
  {
    planVersionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanVersion",
      required: true,
    },
    perspective: {
      type: String,
      enum: PERSPECTIVES,
      required: true,
    },
    sectionKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sectionTitle: {
      type: String,
      required: true,
      trim: true,
    },
    subSection: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    subSectionTitle: {
      type: String,
      default: "",
    },
    indicatorDescription: { type: String, default: "" },
    owner: { type: String, default: "" },
    target: {
        type: metricSchema,
        default: () => ({}),
      },
      achievement: {
        type: Map,
        of: metricSchema,
        default: () => new Map(),
      },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

planSectionSchema.index(
  { planVersionId: 1, perspective: 1, code: 1 },
  { unique: true }
)

planSectionSchema.index({ planVersionId: 1, perspective: 1, themeKey: 1, sortOrder: 1 })

module.exports = mongoose.model("PlanSection", planSectionSchema)
module.exports.PERSPECTIVES = PERSPECTIVES