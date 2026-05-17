const mongoose = require("mongoose")
const { Schema } = mongoose

const invitationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // createdAt = when invite was issued
)

// Fast lookup by email, expire old invites
invitationSchema.index({ email: 1, consumedAt: 1 })
invitationSchema.index({ userId: 1, createdAt: 1 })

module.exports = mongoose.model("Invitation", invitationSchema)