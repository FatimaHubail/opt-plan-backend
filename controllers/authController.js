const validator = require("validator")
const User = require("../models/users/User")
const Invitation = require("../models/users/Invitation")
const bcrypt = require("bcryptjs")
const { signAccessToken } = require("../utils/tokens")
const { accessTokenCookieOptions, clearAccessTokenCookieOptions } =
  require("../utils/cookieOptions")
const { expireUserIfNeeded, getLatestInvitation, isInviteExpired, isUserInviteExpired } =
  require("../utils/inviteExpiry")
const { validatePassword } = require("../utils/validatePassword")
const { hashPassword } = require("../utils/hash")
const { validateUobEmail } = require("../utils/uobEmail")
const { formatDisplayName } = require("../utils/displayName")

function toAuthUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    secondName: user.secondName || "",
    lastName: user.lastName,
    displayName: formatDisplayName(user),
    role: user.role,
  }
}

async function login(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase()
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" })
  }

  const uobEmailCheck = validateUobEmail(email)
  if (!uobEmailCheck.ok) {
    return res.status(400).json({ message: uobEmailCheck.message })
  }

  const invalid = () =>
    res.status(401).json({ message: "Invalid email or password" })

  const user = await User.findOne({ email }).select("+passwordHash")
  if (!user) return invalid()

  await expireUserIfNeeded(user)

  if (user.status === "invite_expired") {
    return res.status(401).json({
      message: "Invitation expired. Contact your administrator.",
      code: "INVITE_EXPIRED",
    })
  }

  if (user.status === "invited") {
    const latestInvite = await getLatestInvitation(user._id)
    if (isInviteExpired(latestInvite) || isUserInviteExpired(user)) {
      user.status = "invite_expired"
      await user.save()
      return res.status(401).json({
        message: "Invitation expired. Contact your administrator.",
        code: "INVITE_EXPIRED",
      })
    }
  }

  if (user.status === "not_invited") {
    return res.status(401).json({
      message:
        "Account not activated. Contact your administrator to receive an invitation.",
      code: "NOT_INVITED",
    })
  }

  if (!["active", "invited"].includes(user.status)) {
    return invalid()
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return invalid()

  if (user.status === "invited") {
    user.status = "active"
    await user.save()

    await Invitation.updateMany(
      { userId: user._id, consumedAt: null },
      { $set: { consumedAt: new Date() } }
    )
  }

  const token = signAccessToken(user)
  res.cookie("accessToken", token, accessTokenCookieOptions())

  return res.json({
    user: toAuthUser(user),
    requiresPasswordChange: Boolean(user.mustChangePassword),
  })
}

async function changePassword(req, res) {
  const currentPassword = req.body.currentPassword
  const newPassword = req.body.newPassword

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required",
    })
  }

  const check = validatePassword(newPassword)
  if (!check.ok) {
    return res.status(400).json({ message: check.message })
  }

  const user = await User.findById(req.user._id).select("+passwordHash")
  if (!user) return res.status(401).json({ message: "Unauthorized" })

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    return res.status(400).json({ message: "Current password is incorrect" })
  }

  const sameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash)
  if (sameAsCurrent) {
    return res.status(400).json({
      message: "New password must be different from current password",
    })
  }

  user.passwordHash = await hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()

  return res.json({ message: "Password updated" })
}

function me(req, res) {
  return res.json({
    user: {
      ...toAuthUser(req.user),
      mustChangePassword: req.user.mustChangePassword,
    },
  })
}

function logout(req, res) {
  res.clearCookie("accessToken", clearAccessTokenCookieOptions())
  return res.status(204).send()
}

module.exports = { login, me, logout, changePassword }