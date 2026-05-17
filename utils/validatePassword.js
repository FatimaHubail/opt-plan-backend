const MIN_LENGTH = 12

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { ok: false, message: "Password is required" }
  }

  if (password.length < MIN_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_LENGTH} characters` }
  }

  if (/\s/.test(password)) {
    return { ok: false, message: "Password must not contain spaces" }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    return {
      ok: false,
      message:
        "Password must include at least one uppercase, lowercase, number, and special character",
    }
  }

  return { ok: true }
}

module.exports = { validatePassword, MIN_LENGTH }