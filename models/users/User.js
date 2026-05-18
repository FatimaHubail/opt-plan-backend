const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const { formatDisplayName } = require("../../utils/displayName")

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    secondName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["administrator", "auditor", "contributor", "indicator_owner", "president"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "invited", "not_invited", "invite_expired"],
      default: "not_invited",
    },

    mustChangePassword: { type: Boolean, default: false },

    inviteExpiresAt: { type: Date, default: null },

    affiliations: [
      {
        departmentName: String,
        subUnits: [String],
      },
    ],
  },
  { timestamps: true }
)

userSchema.virtual("displayName").get(function () {
  return formatDisplayName(this)
})

userSchema.set("toJSON", { virtuals: true })
userSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("User", userSchema)
