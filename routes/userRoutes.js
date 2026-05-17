const router = require("express").Router()
const { requireAuth, requireRole } = require("../middleware/auth")
const { createUserLimiter, resendInviteLimiter } = require("../middleware/rateLimit")
const asyncHandler = require("../middleware/asyncHandler")
const {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  sendInvite,
  resendInvite,
} = require("../controllers/userController")

const adminOnly = [requireAuth, requireRole("administrator")]

router.post("/", ...adminOnly, createUserLimiter, asyncHandler(createUser))
router.get("/", ...adminOnly, asyncHandler(listUsers))
router.get("/:id", ...adminOnly, asyncHandler(getUser))
router.patch("/:id", ...adminOnly, asyncHandler(updateUser))
router.delete("/:id", ...adminOnly, asyncHandler(deleteUser))
router.post(
  "/:id/send-invite",
  ...adminOnly,
  resendInviteLimiter,
  asyncHandler(sendInvite)
)
router.post(
  "/:id/resend-invite",
  ...adminOnly,
  resendInviteLimiter,
  asyncHandler(resendInvite)
)

module.exports = router
