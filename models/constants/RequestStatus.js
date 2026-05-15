const REQUEST_STATUSES = [
    "draft",
    "pending",
    "changes_requested",
    "edited",
    "accepted",
  ]
  
  const REQUEST_STATUS = {
    DRAFT: "draft",
    PENDING: "pending",
    CHANGES_REQUESTED: "changes_requested",
    EDITED: "edited",
    ACCEPTED: "accepted",
  }
  
  /** UI labels (Proposals Status, queues) */
  const REQUEST_STATUS_LABELS = {
    draft: "Draft",
    pending: "Pending auditor review",
    changes_requested: "Changes requested",
    edited: "Edited - awaiting re-review",
    accepted: "Accepted",
  }
  
  /** Maps to React proposalStatusChip tones */
  const REQUEST_STATUS_TONES = {
    draft: "default",
    pending: "pending",
    changes_requested: "changes",
    edited: "review",
    accepted: "accepted",
  }
  
  module.exports = {
    REQUEST_STATUSES,
    REQUEST_STATUS,
    REQUEST_STATUS_LABELS,
    REQUEST_STATUS_TONES,
  }