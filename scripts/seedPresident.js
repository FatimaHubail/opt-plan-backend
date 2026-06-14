require("dotenv").config()
const mongoose = require("mongoose")
const User = require("../models/users/User")
const { hashPassword } = require("../utils/hash")

const PRESIDENT = {
  email: "fuad.alansari@uob.edu.bh",
  firstName: "Fuad",
  secondName: "Mohammed",
  lastName: "Al-Ansari",
  role: "president",
  password: "President-Test-123!",
  affiliations: [
    {
      departmentName: "President's Office",
      subUnits: [],
    },
  ],
}

async function main() {
  await mongoose.connect(process.env.DATABASE_URI)

  await User.deleteOne({ email: "president@uob.edu.bh" })

  const exists = await User.findOne({ email: PRESIDENT.email })
  if (exists) {
    exists.firstName = PRESIDENT.firstName
    exists.secondName = PRESIDENT.secondName
    exists.lastName = PRESIDENT.lastName
    exists.role = PRESIDENT.role
    exists.status = "active"
    exists.affiliations = PRESIDENT.affiliations
    exists.passwordHash = await hashPassword(PRESIDENT.password)
    await exists.save()
    console.log("President updated:", PRESIDENT.email)
    process.exit(0)
  }

  const passwordHash = await hashPassword(PRESIDENT.password)
  await User.create({
    email: PRESIDENT.email,
    firstName: PRESIDENT.firstName,
    secondName: PRESIDENT.secondName,
    lastName: PRESIDENT.lastName,
    role: PRESIDENT.role,
    passwordHash,
    status: "active",
    affiliations: PRESIDENT.affiliations,
  })

  console.log("President created:", PRESIDENT.email)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
