const router = require("express").Router();
const { getCourses, getCourseById, getProfile } = require("../controllers/courseController");
const { auth } = require("../middleware/authMiddleware");

// Public: list all published courses
router.get("/", getCourses);

// Public: get details for a single course
router.get("/:id", getCourseById);

// Authenticated: personalized profile (user info + tests)
router.get("/me/profile", auth, getProfile);

module.exports = router;

