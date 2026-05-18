const UOB_DOMAIN = "uob.edu.bh"

function validateUobEmail(email) {
  const normalized = String(email || "").trim().toLowerCase()

  if (!normalized) {
    return { ok: false, message: "Email is required" }
  }

  if (!normalized.endsWith(`@${UOB_DOMAIN}`)) {
    return { ok: false, message: `Email must be a ${UOB_DOMAIN} address` }
  }

  const localPart = normalized.slice(0, -(UOB_DOMAIN.length + 1))
  if (!localPart) {
    return { ok: false, message: "Email is invalid" }
  }

  return { ok: true }
}

module.exports = { validateUobEmail, UOB_DOMAIN }
