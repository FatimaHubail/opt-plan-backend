function errorHandler(err, req, res, next) {
  console.error(err)

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message })
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Unauthorized" })
  }

  return res.status(500).json({ message: "Internal server error" })
}

module.exports = errorHandler
