const validator = require("validator")
const User = require("../models/users/User")
const Invitation = require("../models/users/Invitation")
const { mapRole } = require("../utils/mapRole")
const { validatePassword } = require("../utils/validatePassword")
const { hashPassword } = require("../utils/hash")
const { buildInviteExpiry, expireUserIfNeeded } = require("../utils/inviteExpiry")
const { sendInvitationEmail } = require("../services/mailService")
const { isValidObjectId } = require("../utils/validateObjectId")

function toPublicUser(user) {
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    inviteExpiresAt: user.inviteExpiresAt,
    mustChangePassword: user.mustChangePassword,
  }
}

function normalizeAffiliations(input) {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => ({
      departmentName: String(item?.departmentName || "").trim(),
      subUnits: Array.isArray(item?.subUnits)
        ? item.subUnits.map((s) => String(s).trim()).filter(Boolean)
        : [],
    }))
    .filter((item) => item.departmentName)
}

function notFound(res) {
  return res.status(404).json({ message: "User not found" })
}

async function findUserByIdParam(req, res, { withPasswordHash = false } = {}) {
  if (!isValidObjectId(req.params.id)) {
    notFound(res)
    return null
  }

  const query = User.findById(req.params.id)
  if (withPasswordHash) query.select("+passwordHash")

  const user = await query
  if (!user) {
    notFound(res)
    return null
  }

  return user
}

async function applyInvitationAndEmail({ user, password, createdByUserId }) {
  const prior = {
    passwordHash: user.passwordHash,
    mustChangePassword: user.mustChangePassword,
    status: user.status,
    inviteExpiresAt: user.inviteExpiresAt,
  }

  const expiresAt = buildInviteExpiry()
  const passwordHash = await hashPassword(password)

  user.passwordHash = passwordHash
  user.mustChangePassword = true
  user.status = "invited"
  user.inviteExpiresAt = expiresAt
  await user.save()

  await Invitation.updateMany(
    { userId: user._id, consumedAt: null },
    { $set: { consumedAt: new Date() } }
  )

  const invitation = await Invitation.create({
    userId: user._id,
    email: user.email,
    expiresAt,
    createdByUserId,
  })

  try {
    await sendInvitationEmail({
      to: user.email,
      fullName: user.fullName,
      email: user.email,
      password,
      role: user.role,
      loginUrl: `${process.env.CLIENT_ORIGIN}/login`,
      expiresAt,
    })
  } catch (err) {
    user.passwordHash = prior.passwordHash
    user.mustChangePassword = prior.mustChangePassword
    user.status = prior.status
    user.inviteExpiresAt = prior.inviteExpiresAt
    await user.save()
    await Invitation.findByIdAndDelete(invitation._id)
    throw err
  }
}

async function createUser(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase()
  const fullName = String(req.body.fullName || "").trim()
  const password = req.body.password
  const sendInvite = req.body.sendInvite !== false
  const affiliations = normalizeAffiliations(req.body.affiliations)

  if (!email || !fullName || !password) {
    return res.status(400).json({ message: "Email, full name, and password are required" })
  }

  if (affiliations.length === 0) {
    return res.status(400).json({ message: "At least one department affiliation is required" })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" })
  }

  const dbRole = mapRole(req.body.role)
  if (!dbRole) {
    return res.status(400).json({ message: "Invalid role" })
  }

  const passwordCheck = validatePassword(password)
  if (!passwordCheck.ok) {
    return res.status(400).json({ message: passwordCheck.message })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ message: "Email already in use" })
  }

  const passwordHash = await hashPassword(password)

  const user = await User.create({
    email,
    fullName,
    role: dbRole,
    passwordHash,
    affiliations,
    status: sendInvite ? "invited" : "not_invited",
    mustChangePassword: true,
    inviteExpiresAt: sendInvite ? buildInviteExpiry() : null,
  })

  if (sendInvite) {
    try {
      await applyInvitationAndEmail({
        user: await User.findById(user._id).select("+passwordHash"),
        password,
        createdByUserId: req.user._id,
      })
    } catch (err) {
      console.error("sendInvitationEmail failed:", err)
      await User.findByIdAndDelete(user._id)
      await Invitation.deleteMany({ userId: user._id })
      return res.status(503).json({ message: "Could not send invitation email" })
    }

    const refreshed = await User.findById(user._id)
    return res.status(201).json({ user: toPublicUser(refreshed) })
  }

  return res.status(201).json({ user: toPublicUser(user) })
}

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 })

  for (const user of users) {
    if (user.status === "invited") {
      await expireUserIfNeeded(user)
    }
  }

  const refreshed = await User.find().sort({ createdAt: -1 })
  return res.json({ users: refreshed.map(toPublicUser) })
}

async function getUser(req, res) {
  const user = await findUserByIdParam(req, res)
  if (!user) return

  if (user.status === "invited") {
    await expireUserIfNeeded(user)
  }

  const refreshed = await User.findById(user._id)
  return res.json({ user: toPublicUser(refreshed) })
}

async function updateUser(req, res) {
  const user = await findUserByIdParam(req, res)
  if (!user) return

  const { fullName, role, affiliations } = req.body
  const updates = {}

  if (fullName !== undefined) {
    const name = String(fullName).trim()
    if (!name) {
      return res.status(400).json({ message: "Full name cannot be empty" })
    }
    updates.fullName = name
  }

  if (role !== undefined) {
    const dbRole = mapRole(role)
    if (!dbRole) {
      return res.status(400).json({ message: "Invalid role" })
    }
    updates.role = dbRole
  }

  if (affiliations !== undefined) {
    const normalized = normalizeAffiliations(affiliations)
    if (normalized.length === 0) {
      return res.status(400).json({ message: "At least one department affiliation is required" })
    }
    updates.affiliations = normalized
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" })
  }

  Object.assign(user, updates)
  await user.save()

  return res.json({ user: toPublicUser(user) })
}

async function deleteUser(req, res) {
  const user = await findUserByIdParam(req, res)
  if (!user) return

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" })
  }

  await Invitation.deleteMany({ userId: user._id })
  await User.findByIdAndDelete(user._id)

  return res.status(204).send()
}

async function sendInvite(req, res) {
  const password = req.body.password

  if (!password) {
    return res.status(400).json({ message: "Password is required to send invitation" })
  }

  const passwordCheck = validatePassword(password)
  if (!passwordCheck.ok) {
    return res.status(400).json({ message: passwordCheck.message })
  }

  const user = await findUserByIdParam(req, res, { withPasswordHash: true })
  if (!user) return

  if (user.status !== "not_invited") {
    return res.status(400).json({
      message: "Send invite is only available for users who have not been invited yet",
    })
  }

  try {
    await applyInvitationAndEmail({
      user,
      password,
      createdByUserId: req.user._id,
    })
  } catch (err) {
    console.error("send invite email failed:", err)
    return res.status(503).json({ message: "Could not send invitation email" })
  }

  const refreshed = await User.findById(user._id)
  return res.json({ user: toPublicUser(refreshed) })
}

async function resendInvite(req, res) {
  const password = req.body.password

  if (!password) {
    return res.status(400).json({ message: "Password is required to resend invitation" })
  }

  const passwordCheck = validatePassword(password)
  if (!passwordCheck.ok) {
    return res.status(400).json({ message: passwordCheck.message })
  }

  const user = await findUserByIdParam(req, res, { withPasswordHash: true })
  if (!user) return

  if (!["invited", "invite_expired"].includes(user.status)) {
    return res.status(400).json({
      message: "Resend invite is only available for invited or expired invitations",
    })
  }

  try {
    await applyInvitationAndEmail({
      user,
      password,
      createdByUserId: req.user._id,
    })
  } catch (err) {
    console.error("resend invite email failed:", err)
    return res.status(503).json({ message: "Could not send invitation email" })
  }

  const refreshed = await User.findById(user._id)
  return res.json({ user: toPublicUser(refreshed) })
}

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  sendInvite,
  resendInvite,
}
