const router = require("express").Router();
const {
  getTestDetails,
  startTest,
  answerQuestion,
  getQuestion,
  getTestById
} = require("../controllers/testController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

// Fetch full test details by MongoDB _id (for internal/admin use or summary)
router.get("/id/:testId", auth, getTestById);
router.get("/:testId/result", auth, getTestById);

// Fetch a test by its public unique URL (used in shared links)
router.get("/url/:uniqueURL", auth, getTestDetails);
router.post("/start", auth, startTest); //start question
router.get("/:testId/questions", auth, getQuestion); // fetch new question

// Submit an answer for a question
router.post("/:testId/answer", auth, answerQuestion);

module.exports = router;
