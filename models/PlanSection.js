const mongoose = require("mongoose")
const { Schema } = mongoose
const { metricSchema } = require("./constants/MetricSchema")
const {
  PERSPECTIVES,
  sectionFields,
  subSectionFields,
} = require("./constants/PlanSectionTree")

const planSectionSchema = new Schema(
  {
    planVersionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanVersion",
      required: true,
      index: true,
    },

    // many departments can share this subsection (M2M, no junction collection)
    departmentIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Department" }],
      default: [],
      index: true,
    },

    ...sectionBlockFields,
    ...subSectionFields,

    indicatorDescription: { type: String, default: "" },
    owner: { type: String, default: "" },
    target: { type: metricSchema, default: () => ({}) },
    achievement: {
      type: Map,
      of: metricSchema,
      default: () => new Map(),
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

planSectionSchema.index(
  { planVersionId: 1, subSection: 1 },
  { unique: true }
)

planSectionSchema.index({
  departmentIds: 1,
  perspective: 1,
  sectionKey: 1,
  sortOrder: 1,
})

module.exports = mongoose.model("PlanSection", planSectionSchema)
module.exports.PERSPECTIVES = PERSPECTIVES