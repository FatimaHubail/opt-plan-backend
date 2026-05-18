function formatDisplayName(user) {
  if (!user) return ""
  return [user.firstName, user.secondName, user.lastName].filter(Boolean).join(" ")
}

module.exports = { formatDisplayName }
