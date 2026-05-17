const Invitation = require("../models/users/Invitation")
const { INVITE_EXPIRES_MS } = require("./inviteConfig")

async function getLatestInvitation(userId) {
  return Invitation.findOne({
    userId,
    consumedAt: null,
  })
    .sort({ createdAt: -1 })
    .lean()
}

function isInviteExpired(invitation) {
  if (!invitation?.expiresAt) return false
  return new Date(invitation.expiresAt) < new Date()
}

function isUserInviteExpired(user) {
  if (user?.inviteExpiresAt) {
    return new Date(user.inviteExpiresAt) < new Date()
  }
  return false
}

async function expireUserIfNeeded(user) {
  if (!user || user.status !== "invited") return user

  const latestInvite = await getLatestInvitation(user._id)
  const expired =
    isInviteExpired(latestInvite) || isUserInviteExpired(user)

  if (!expired) return user

  user.status = "invite_expired"
  await user.save()
  return user
}

function buildInviteExpiry() {
  return new Date(Date.now() + INVITE_EXPIRES_MS)
}

module.exports = {
  getLatestInvitation,
  isInviteExpired,
  isUserInviteExpired,
  expireUserIfNeeded,
  buildInviteExpiry,
}