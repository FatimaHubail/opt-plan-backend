const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["administrator", "auditor", "contributor", "indicator_owner, president"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "invited", "not_invited"],
      default: "not_invited",
    },
    affiliations: [
      {
        departmentName: String,
        subUnits: [String],
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)