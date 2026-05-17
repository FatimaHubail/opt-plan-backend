const UI_TO_DB_ROLE = {
    admin: "administrator",
    owner: "indicator_owner",
    contributor: "contributor",
    auditor: "auditor",
    administrator: "administrator",
    indicator_owner: "indicator_owner",
    president: "president",
  }
  
  const VALID_DB_ROLES = [
    "administrator",
    "auditor",
    "contributor",
    "indicator_owner",
    "president",
  ]
  
  function mapRole(input) {
    if (!input || typeof input !== "string") return null
    const key = input.trim().toLowerCase()
    const mapped = UI_TO_DB_ROLE[key]
    if (!mapped || !VALID_DB_ROLES.includes(mapped)) return null
    return mapped
  }
  
  module.exports = { mapRole, VALID_DB_ROLES }