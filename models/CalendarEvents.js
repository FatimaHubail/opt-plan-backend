const mongoose = require("mongoose")
const { Schema } = mongoose

const calendarEventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    start: {
      type: Date,
      required: true,
    },

    end: {
      type: Date,
      required: true,
    },

    planSectionId: {
      type: Schema.Types.ObjectId,
      ref: "PlanSection",
      default: null,
    },
  },
  { timestamps: true }
)

// Events in a date range (month / week view)
calendarEventSchema.index({ start: 1, end: 1 })

// Events for one plan section in a range
calendarEventSchema.index({ planSectionId: 1, start: 1 })

calendarEventSchema.pre("validate", function (next) {
  if (this.start && this.end && this.end < this.start) {
    return next(new Error("end must be >= start"))
  }
  next()
})

module.exports = mongoose.model("CalendarEvent", calendarEventSchema)