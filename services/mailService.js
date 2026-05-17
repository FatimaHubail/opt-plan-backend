const nodemailer = require("nodemailer")

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === "true"

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function assertMailConfig() {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "CLIENT_ORIGIN"]
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing mail env: ${missing.join(", ")}`)
  }
}

function formatExpiryDate(expiresAt) {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Bahrain", 
    }).format(new Date(expiresAt))
}

const ROLE_LABELS = {
    administrator: "Administrator",
    auditor: "Auditor",
    contributor: "Contributor",
    indicator_owner: "Indicator Owner",
    president: "UoB President",
}

function formatRoleLabel(role) {
    return ROLE_LABELS[role] || role
}

function buildInvitationContent({ fullName, email, password, loginUrl, expiresAt, role }) {
    const appName = process.env.APP_NAME || "UoB Strategic Plan Workspace"
    const validUntil = formatExpiryDate(expiresAt)
    const roleLabel = formatRoleLabel(role)
  
    const subject = `${appName} - account invitation`
  
    const text = [
      `Dear ${fullName},`,
      ``,
      `You have been invited to access the ${appName} as ${roleLabel}.`,
      ``,
      `Sign in at: ${loginUrl}`,
      `Email: ${email}`,
      `Password: ${password}`,
      ``,
      `Valid until: ${validUntil}`,
      `After that date, this invitation expires. Contact your administrator to receive a new password and invitation.`,
      ``,
      `For security, change your password after your first sign-in.`,
      ``,
      `If you did not expect this message, ignore it or contact your administrator.`,
    ].join("\n")
  
    const html = `
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>You have been invited to access <strong>${escapeHtml(appName)}</strong> as <strong>${escapeHtml(roleLabel)}</strong>.</p>
      <p><a href="${escapeHtml(loginUrl)}">Sign in here</a></p>
      <ul>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Password:</strong> ${escapeHtml(password)}</li>
      </ul>
      <p><strong>Valid until:</strong> ${escapeHtml(validUntil)}</p>
      <p>After that date, this invitation expires. Contact your administrator to receive a new password and invitation.</p>
      <p>For security, change your password after your first sign-in.</p>
      <p>If you did not expect this message, ignore it or contact your administrator.</p>
    `
  
    return { subject, text, html }
}
  
function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
}

async function sendInvitationEmail({ to, fullName, email, password, loginUrl, expiresAt, role }) {
    assertMailConfig()
  
    const transport = createTransport()
    const { subject, text, html } = buildInvitationContent({
      fullName,
      email,
      password,
      loginUrl,
      expiresAt,
      role,
    })
  
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    })
  
    // Safe log: message id only 
    console.log("Invitation email sent:", { to, messageId: info.messageId })
  
    return info
}
  
module.exports = { sendInvitationEmail }

