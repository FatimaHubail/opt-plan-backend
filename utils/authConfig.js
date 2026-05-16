const ms = require("ms")

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m"
const ACCESS_TOKEN_MAX_AGE_MS = ms(ACCESS_TOKEN_EXPIRES_IN)

if (ACCESS_TOKEN_MAX_AGE_MS == null) {
  throw new Error(`Invalid JWT_ACCESS_EXPIRES_IN: ${ACCESS_TOKEN_EXPIRES_IN}`)
}

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_MAX_AGE_MS,
}