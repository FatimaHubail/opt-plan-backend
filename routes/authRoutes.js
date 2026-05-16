const router = require("express").Router()
const { login, me, logout } = require("../controllers/authController")
const { loginLimiter } = require("../middleware/rateLimit")
const { requireAuth } = require("../middleware/auth")
const asyncHandler = require("../middleware/asyncHandler")

router.post("/login", loginLimiter, asyncHandler(login))
router.post("/logout", requireAuth, asyncHandler(logout))
router.get("/me", requireAuth, asyncHandler(me))

module.exports = router
