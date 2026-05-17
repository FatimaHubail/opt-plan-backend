const ms = require("ms")
const INVITE_EXPIRES_IN = process.env.INVITE_EXPIRES_IN || "168h"
const INVITE_EXPIRES_MS = ms(INVITE_EXPIRES_IN)

if (INVITE_EXPIRES_MS == null) {
    throw new Error(`Invalid INVITE_EXPIRES_IN: ${INVITE_EXPIRES_IN}`)
}

module.exports = { INVITE_EXPIRES_IN, INVITE_EXPIRES_MS }