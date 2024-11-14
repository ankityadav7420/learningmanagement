const router = require("express").Router();
const {
  getTestDetails,
  startTest,
  answerQuestion,
  getTestById
} = require("../controllers/testController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

router.get("/:uniqueURL", auth, adminAuth, getTestDetails);
router.post("/start", auth, startTest);
router.post("/:testId/questions/:questionId/answer", auth, answerQuestion);
router.get("/id/:testId", auth, getTestById);

module.exports = router;
