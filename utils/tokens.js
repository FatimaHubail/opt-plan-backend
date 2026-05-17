const jwt = require("jsonwebtoken")
const { ACCESS_TOKEN_EXPIRES_IN } = require("./authConfig")

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  )
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

module.exports = { signAccessToken, verifyAccessToken }