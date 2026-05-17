const User = require("../models/users/User")
const { expireUserIfNeeded } = require("../utils/inviteExpiry")

async function expireInvitesJob() {
  const users = await User.find({ status: "invited" })
  for (const user of users) {
    await expireUserIfNeeded(user)
  }
}

module.exports = { expireInvitesJob }