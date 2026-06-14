const router = require("express").Router()
const { login, me, logout, changePassword, forgotPassword } = require("../controllers/authController")
const { loginLimiter, changePasswordLimiter } = require("../middleware/rateLimit")
const { requireAuth } = require("../middleware/auth")
const asyncHandler = require("../middleware/asyncHandler")

router.post("/login", loginLimiter, asyncHandler(login))
router.post("/forgot-password", loginLimiter, asyncHandler(forgotPassword))
router.post("/logout", requireAuth, asyncHandler(logout))
router.get("/me", requireAuth, asyncHandler(me))
router.post(
  "/change-password",
  requireAuth,
  changePasswordLimiter,
  asyncHandler(changePassword)
)

module.exports = router