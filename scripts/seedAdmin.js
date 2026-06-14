require("dotenv").config()
const mongoose = require("mongoose")
const User = require("../models/users/User")
const { hashPassword } = require("../utils/hash")

async function main() {
  await mongoose.connect(process.env.DATABASE_URI)

  const email = "admin@uob.edu.bh"
  const exists = await User.findOne({ email })
  if (exists) {
    console.log("Admin already exists:", email)
    process.exit(0)
  }

  const passwordHash = await hashPassword("Admin-Test-123!")
  await User.create({
    email,
    firstName: "Test",
    secondName: "System",
    lastName: "Admin",
    role: "administrator",
    passwordHash,
    status: "active",
    affiliations: [],
  })

  console.log("Admin created:", email)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
