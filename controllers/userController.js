const validator = require("validator")
const User = require("../models/users/User")
const Invitation = require("../models/users/Invitation")
const { mapRole } = require("../utils/mapRole")
const { validatePassword } = require("../utils/validatePassword")
const { hashPassword } = require("../utils/hash")
const { buildInviteExpiry, expireUserIfNeeded } = require("../utils/inviteExpiry")
const { sendInvitationEmail } = require("../services/mailService")
const { isValidObjectId } = require("../utils/validateObjectId")
const { validateUobEmail } = require("../utils/uobEmail")
const { formatDisplayName } = require("../utils/displayName")
const {
  formatInviteExpiryIsoGmt3,
  formatInviteExpiryDisplay,
} = require("../utils/formatInviteExpiry")

function toPublicUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    secondName: user.secondName || "",
    lastName: user.lastName,
    displayName: formatDisplayName(user),
    role: user.role,
    status: user.status,
    inviteExpiresAt: formatInviteExpiryIsoGmt3(user.inviteExpiresAt),
    inviteExpiresAtDisplay: user.inviteExpiresAt
      ? `${formatInviteExpiryDisplay(user.inviteExpiresAt)} (GMT+3)`
      : null,
    mustChangePassword: user.mustChangePassword,
  }
}

function parseNameFields(body) {
  return {
    firstName: String(body.firstName || "").trim(),
    secondName: String(body.secondName || "").trim(),
    lastName: String(body.lastName || "").trim(),
  }
}

function validateNameFields({ firstName, secondName, lastName }) {
  if (!firstName || !secondName || !lastName) {
    return { ok: false, message: "First name, second name, and last name are required" }
  }
  return { ok: true }
}

function validateEmailField(email) {
  if (!validator.isEmail(email)) {
    return { ok: false, message: "Invalid email address" }
  }
  return validateUobEmail(email)
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
      displayName: formatDisplayName(user),
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
  const names = parseNameFields(req.body)
  const password = req.body.password
  const sendInvite = req.body.sendInvite !== false
  const affiliations = normalizeAffiliations(req.body.affiliations)

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  const nameCheck = validateNameFields(names)
  if (!nameCheck.ok) {
    return res.status(400).json({ message: nameCheck.message })
  }

  if (affiliations.length === 0) {
    return res.status(400).json({ message: "At least one department affiliation is required" })
  }

  const emailCheck = validateEmailField(email)
  if (!emailCheck.ok) {
    return res.status(400).json({ message: emailCheck.message })
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
    firstName: names.firstName,
    secondName: names.secondName,
    lastName: names.lastName,
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

  const { role, affiliations, email } = req.body
  const updates = {}

  if (
    req.body.firstName !== undefined ||
    req.body.secondName !== undefined ||
    req.body.lastName !== undefined
  ) {
    const names = {
      firstName:
        req.body.firstName !== undefined
          ? String(req.body.firstName).trim()
          : user.firstName,
      secondName:
        req.body.secondName !== undefined
          ? String(req.body.secondName).trim()
          : user.secondName || "",
      lastName:
        req.body.lastName !== undefined ? String(req.body.lastName).trim() : user.lastName,
    }
    const nameCheck = validateNameFields(names)
    if (!nameCheck.ok) {
      return res.status(400).json({ message: nameCheck.message })
    }
    updates.firstName = names.firstName
    updates.secondName = names.secondName
    updates.lastName = names.lastName
  }

  if (email !== undefined) {
    const normalized = String(email).trim().toLowerCase()
    const emailCheck = validateEmailField(normalized)
    if (!emailCheck.ok) {
      return res.status(400).json({ message: emailCheck.message })
    }
    if (normalized !== user.email) {
      const taken = await User.findOne({ email: normalized })
      if (taken) {
        return res.status(409).json({ message: "Email already in use" })
      }
    }
    updates.email = normalized
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
