const crypto = require("crypto");
const Test = require("../models/Test");
const Question = require("../models/Question");
const { sendJsonResponse } = require("../utils/responseHandler");

const testDuration = 10 * 60 * 1000;

// =============================
// START TEST
// =============================
exports.startTest = async (req, res) => {
  try {
    const initialDifficulty = parseInt(process.env.INITIAL_DIFFICULTY, 10);
    const totalQuestionsEnv = parseInt(process.env.TEST_TOTAL_QUESTIONS, 10);

    const [initialQuestion] = await Question.aggregate([
      { $match: { difficulty: initialDifficulty } },
      { $sample: { size: 1 } },
      { $project: { correctAnswer: 0 } }
    ]);

    if (!initialQuestion) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Test start failed: no initial question found."
      );
    }

    const uniqueURL = crypto.randomBytes(16).toString("hex");

    const test = new Test({
      user: req.user._id,
      attemptedQuestions: 1,
      score: 0,
      totalQuestions: totalQuestionsEnv,
      questions: [{ questionId: initialQuestion._id }],
      startTime: Date.now(),
      uniqueURL
    });

    await test.save();

    return sendJsonResponse(res, 201, true, "Test started successfully", {
      testId: test._id,
      uniqueURL,
      question: initialQuestion
    });
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Test start failed due to a server error.",
      null,
      error
    );
  }
};

// =============================
// GET NEXT QUESTION
// =============================
exports.getQuestion = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Next question retrieval failed: test not found."
      );
    }

    const lastQuestion = test.questions[test.questions.length - 1];
    const lastQuestionData = await Question.findById(lastQuestion.questionId);

    const wasCorrect =
      lastQuestion.answer &&
      lastQuestion.answer === lastQuestionData.correctAnswer;

    const nextDifficulty = wasCorrect
      ? lastQuestionData.difficulty + 1
      : lastQuestionData.difficulty - 1;

    const usedIds = test.questions.map((q) => q.questionId);

    let nextQuestion = await Question.findOne({
      difficulty: nextDifficulty,
      _id: { $nin: usedIds }
    }).select("-correctAnswer");

    if (!nextQuestion) {
      nextQuestion = await Question.findOne({
        _id: { $nin: usedIds }
      }).select("-correctAnswer");
    }

    if (!nextQuestion) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Next question retrieval failed: no unused questions available."
      );
    }

    return sendJsonResponse(res, 200, true, "Next question retrieved successfully", {
      question: nextQuestion,
      score: test.score
    });
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Next question retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// =============================
// SUBMIT ANSWER
// =============================
exports.answerQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, answer } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Answer submission failed: test not found."
      );
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Answer submission failed: question not found."
      );
    }

    const isCorrect = answer === question.correctAnswer;

    if (isCorrect) {
      test.score += question.difficulty;
    }

    const existingEntry = test.questions.find(
      (q) => String(q.questionId) === String(questionId)
    );

    if (existingEntry) {
      existingEntry.answer = answer;
    } else {
      test.questions.push({ questionId, answer });
      test.attemptedQuestions += 1; // ✅ increment only for new question
    }

    // Correct streak (last 3 answers correct)
    const lastThree = test.questions.slice(-3);

    const correctStreak =
      lastThree.length === 3 &&
      lastThree.every((q) => {
        const qData = questionId === String(q.questionId)
          ? question
          : null;
        return q.answer && q.answer === (qData?.correctAnswer || q.answer);
      });

    if (
      test.attemptedQuestions >= test.totalQuestions ||
      correctStreak ||
      question.difficulty <= 1
    ) {
      test.completed = true;
      await test.save();

      return sendJsonResponse(res, 200, true, "Test completed", {
        score: test.score
      });
    }

    await test.save();

    return sendJsonResponse(
      res,
      200,
      true,
      "Answer submitted successfully",
      {
        testId,
        score: test.score
      }
    );
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Answer submission failed due to a server error.",
      null,
      error
    );
  }
};

// =============================
// GET TEST BY ID (ADMIN)
// =============================
exports.getTestById = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate("questions.questionId");

    if (!test) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Test retrieval failed: test not found."
      );
    }

    return sendJsonResponse(
      res,
      200,
      true,
      "Test retrieved successfully",
      test
    );
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Test retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// =============================
// GET TEST BY UNIQUE URL
// =============================
exports.getTestDetails = async (req, res) => {
  try {
    const { uniqueURL } = req.params;

    const test = await Test.findOne({ uniqueURL }).populate(
      "questions.questionId"
    );

    if (!test) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Test retrieval by URL failed: test not found."
      );
    }

    return sendJsonResponse(
      res,
      200,
      true,
      "Test retrieved successfully by unique URL",
      test
    );
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Test retrieval failed due to a server error.",
      null,
      error
    );
  }
};