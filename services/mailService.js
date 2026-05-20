const nodemailer = require("nodemailer")
const { EMAIL_THEME: t } = require("../utils/emailTheme")
const { formatInviteExpiryDisplay } = require("../utils/formatInviteExpiry")

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

const ROLE_LABELS = {
    administrator: "Administrator",
    auditor: "Auditor",
    contributor: "Contributor",
    indicator_owner: "Indicator Owner",
    president: "President",
}

function formatRoleLabel(role) {
    return ROLE_LABELS[role] || role
}

function buildInvitationHtml({ displayName, email, password, loginUrl, expiresAt, role }) {
  const appName = process.env.APP_NAME || "UoB Strategic Plan Workspace"
  const validUntil = formatInviteExpiryDisplay(expiresAt)
  const roleLabel = formatRoleLabel(role)

  const safe = {
    displayName: escapeHtml(displayName),
    appName: escapeHtml(appName),
    roleLabel: escapeHtml(roleLabel),
    email: escapeHtml(email),
    password: escapeHtml(password),
    loginUrl: escapeHtml(loginUrl),
    validUntil: escapeHtml(validUntil),
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safe.appName} invitation</title>
</head>
<body style="margin:0;padding:0;background-color:${t.background};font-family:'Geist Variable',Segoe UI,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${t.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background-color:${t.sidebar};border-radius:16px 16px 0 0;padding:32px 36px 28px;border-bottom:3px solid ${t.primaryHex};border-bottom:3px solid ${t.primary};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${t.sidebarForeground};">University of Bahrain</p>
                    <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:${t.primaryForeground};">${safe.appName}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body card -->
          <tr>
            <td style="background-color:${t.card};border-left:1px solid ${t.border};border-right:1px solid ${t.border};padding:36px 36px 28px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${t.primaryHex};color:${t.primary};letter-spacing:0.04em;text-transform:uppercase;">Account invitation</p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${t.foreground};">Dear <strong>${safe.displayName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${t.mutedForeground};">
                You have been invited to access the workspace as
                <strong style="color:${t.foreground};">${safe.roleLabel}</strong>.
                Use the credentials below to sign in for the first time.
              </p>
              <!-- Role badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:${t.primaryHex};background-color:${t.primary};border:1px solid ${t.primaryHex};border:1px solid ${t.primary};border-radius:999px;padding:8px 16px;">
                    <span style="font-size:13px;font-weight:600;color:${t.primaryForeground};">Role: ${safe.roleLabel}</span>
                  </td>
                </tr>
              </table>
              <!-- Credentials -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;background-color:${t.muted};border:1px solid ${t.border};border-radius:12px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${t.mutedForeground};">Sign-in details</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 12px;font-size:13px;color:${t.mutedForeground};width:88px;vertical-align:top;">Email</td>
                        <td style="padding:0 0 12px;font-size:14px;font-weight:600;color:${t.foreground};word-break:break-all;">${safe.email}</td>
                      </tr>
                      <tr>
                        <td style="padding:0;font-size:13px;color:${t.mutedForeground};width:88px;vertical-align:top;">Password</td>
                        <td style="padding:0;font-size:14px;font-weight:600;color:${t.foreground};font-family:Consolas,Monaco,monospace;letter-spacing:0.02em;word-break:break-all;">${safe.password}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:${t.primaryHex};background-color:${t.primary};">
                    <a href="${safe.loginUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${t.primaryForeground};text-decoration:none;border-radius:10px;">Sign in to workspace</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:${t.mutedForeground};text-align:center;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:${t.primaryHex};color:${t.primary};text-align:center;word-break:break-all;">
                <a href="${safe.loginUrl}" style="color:${t.primaryHex};color:${t.primary};text-decoration:underline;">${safe.loginUrl}</a>
              </p>
              <!-- Expiry notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${t.chart3Muted};border:1px solid ${t.chart3Border};border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${t.chart3Text};">Invitation expires</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${t.foreground};"><strong>${safe.validUntil}</strong> (GMT+3)</p>
                    <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:${t.chart3Text};">After this date, contact your administrator for a new password and invitation.</p>
                  </td>
                </tr>
              </table>
              <!-- Security note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
                <tr>
                  <td style="padding:14px 16px;background-color:${t.chart2Muted};border:1px solid ${t.chart2Border};border-radius:10px;">
                    <p style="margin:0;font-size:13px;line-height:1.55;color:${t.chart2Text};">
                      <strong>Security tip:</strong> Change your password immediately after your first sign-in. Do not share these credentials.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${t.muted};border:1px solid ${t.border};border-top:none;border-radius:0 0 16px 16px;padding:22px 36px 28px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:${t.mutedForeground};text-align:center;">
                If you did not expect this invitation, you can safely ignore this email or contact your administrator.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:${t.mutedForeground};text-align:center;opacity:0.85;">
                &copy; ${new Date().getFullYear()} ${safe.appName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildInvitationContent({ displayName, email, password, loginUrl, expiresAt, role }) {
  const appName = process.env.APP_NAME || "UoB Strategic Plan Workspace"
  const validUntil = formatInviteExpiryDisplay(expiresAt)
  const roleLabel = formatRoleLabel(role)

  const subject = `${appName} - account invitation`

  const text = [
    `Dear ${displayName},`,
    ``,
    `You have been invited to access the ${appName} as ${roleLabel}.`,
    ``,
    `Sign in at: ${loginUrl}`,
    `Email: ${email}`,
    `Password: ${password}`,
    ``,
    `Valid until: ${validUntil} (GMT+3)`,
    `After that date, this invitation expires. Contact your administrator to receive a new password and invitation.`,
    ``,
    `For security, change your password after your first sign-in.`,
    ``,
    `If you did not expect this message, ignore it or contact your administrator.`,
  ].join("\n")

  const html = buildInvitationHtml({
    displayName,
    email,
    password,
    loginUrl,
    expiresAt,
    role,
  })

  return { subject, text, html }
}
  
function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
}

async function sendInvitationEmail({ to, displayName, email, password, loginUrl, expiresAt, role }) {
    assertMailConfig()
  
    const transport = createTransport()
    const { subject, text, html } = buildInvitationContent({
      displayName,
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

