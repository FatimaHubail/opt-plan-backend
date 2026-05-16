const validator = require("validator")
const User = require("../models/users/User")
const bcrypt = require("bcryptjs")
const { signAccessToken } = require("../utils/tokens")
const { accessTokenCookieOptions } = require("../utils/cookieOptions")
const { clearAccessTokenCookieOptions } = require("../utils/cookieOptions")

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase()
    const password = req.body.password

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" })
    }

    const invalid = () =>
      res.status(401).json({ message: "Invalid email or password" })

    const user = await User.findOne({ email }).select("+passwordHash")

    if (!user || user.status !== "active") {
      return invalid()
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return invalid()

    const token = signAccessToken(user)

    res.cookie("accessToken", token, accessTokenCookieOptions())

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("login error:", err)
    return res.status(500).json({ message: "Internal server error" })
  }
}

function me(req, res) {
    return res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
      },
    })
  }

  function logout(req, res) {
    res.clearCookie("accessToken", clearAccessTokenCookieOptions())
    return res.status(204).send()
  }
  

module.exports = { login, me, logout }