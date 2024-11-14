const router = require("express").Router();
const {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

router.post("/", auth, adminAuth, createQuestion);
router.get("/:id", auth, adminAuth, getQuestionById);
router.get("/", auth, adminAuth, getQuestions);

router.put("/:id", auth, adminAuth, updateQuestion);

router.delete("/:id", auth, adminAuth, deleteQuestion);
module.exports = router;
