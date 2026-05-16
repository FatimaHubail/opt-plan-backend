const { ACCESS_TOKEN_MAX_AGE_MS } = require("./authConfig")

function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  }
}

function clearAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }
}

module.exports = { accessTokenCookieOptions, clearAccessTokenCookieOptions }