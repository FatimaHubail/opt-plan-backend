const mongoose = require("mongoose")

function isValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false
  return String(new mongoose.Types.ObjectId(id)) === String(id)
}

module.exports = { isValidObjectId }
