const MIN_LENGTH = 12

const PASSWORD_RULES_MESSAGE = `Password must be at least ${MIN_LENGTH} characters, include at least one uppercase letter, one lowercase letter, one number, and one special character, and must not contain spaces`

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { ok: false, message: "Password is required" }
  }

  const hasMinLength = password.length >= MIN_LENGTH
  const hasNoSpaces = !/\s/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasMinLength || !hasNoSpaces || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    return { ok: false, message: PASSWORD_RULES_MESSAGE }
  }

  return { ok: true }
}

module.exports = { validatePassword, MIN_LENGTH, PASSWORD_RULES_MESSAGE }
