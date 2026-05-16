const { verifyAccessToken } = require("../utils/tokens")
const User = require("../models/users/User")

async function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null)

    if (!token) return res.status(401).json({ message: "Unauthorized" })

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub).select("-passwordHash")

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Unauthorized" })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: "Unauthorized" })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }