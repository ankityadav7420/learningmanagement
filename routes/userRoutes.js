const router = require("express").Router();
const { auth } = require("../middleware/authMiddleware");
const { getMe } = require("../controllers/userController");

// Authenticated: current user details
router.get("/me", auth, getMe);

module.exports = router;

