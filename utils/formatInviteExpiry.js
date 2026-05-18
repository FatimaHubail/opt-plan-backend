const INVITE_TIMEZONE = "Asia/Bahrain"
const INVITE_UTC_OFFSET = "+03:00"

function formatInviteExpiryDisplay(expiresAt) {
  if (!expiresAt) return null
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: INVITE_TIMEZONE,
  }).format(new Date(expiresAt))
}

/** ISO 8601 with +03:00 offset (same instant as stored UTC Date). */
function formatInviteExpiryIsoGmt3(expiresAt) {
  if (!expiresAt) return null

  const d = new Date(expiresAt)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: INVITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d)

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00"
  const ms = String(d.getUTCMilliseconds()).padStart(3, "0")

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.${ms}${INVITE_UTC_OFFSET}`
}

module.exports = {
  formatInviteExpiryDisplay,
  formatInviteExpiryIsoGmt3,
  INVITE_UTC_OFFSET,
}
