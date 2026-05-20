const { ACCESS_TOKEN_MAX_AGE_MS } = require("./authConfig")

function accessTokenCookieOptions() {
  const isProd = process.env.NODE_ENV === "production"
  return {
    httpOnly: true,
    secure: isProd,
    // lax in dev allows cookie when frontend uses a separate API origin; strict + Vite proxy also works
    sameSite: isProd ? "strict" : "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  }
}

function clearAccessTokenCookieOptions() {
  const isProd = process.env.NODE_ENV === "production"
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  }
}

module.exports = { accessTokenCookieOptions, clearAccessTokenCookieOptions }