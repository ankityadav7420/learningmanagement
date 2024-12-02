const router = require("express").Router();
const {
  getTestDetails,
  startTest,
  answerQuestion,
  getQuestion,
  getTestById
} = require("../controllers/testController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

router.get("/:uniqueURL", auth, adminAuth, getTestDetails); // fetch by unique URL - admin
router.post("/start", auth, startTest); //start question
router.get("/:testId/questions", auth, getQuestion); // fetch new question

// Submit an answer for a question
router.post("/:testId/answer", auth, answerQuestion);

router.get("/:testId/result", auth, getTestById);

module.exports = router;
