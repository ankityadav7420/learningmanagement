const crypto = require("crypto");
const Test = require("../models/Test");
const Question = require("../models/Question");
const { sendJsonResponse } = require("../utils/responseHandler");

const totalQuestions = 5;
const testDuration = 10 * 60 * 1000;
/*
exports.startTest = async (req, res) => {
  const initialDifficulty = 5;

  const initialQuestion = await Question.findOne({
    difficulty: initialDifficulty
  }).select("-correctAnswer");

  if (!initialQuestion) {
    return res.status(404).send("No initial question found");
  }

  const uniqueURL = crypto.randomBytes(16).toString("hex");

  const test = new Test({
    user: req.user._id,
    score: 0,
    totalQuestions,
    questions: [{ questionId: initialQuestion._id }],
    startTime: Date.now(),
    uniqueURL: uniqueURL
  });

  await test.save();

  res.send({
    testId: test._id,
    uniqueURL: uniqueURL,
    question: initialQuestion
  });
};

exports.answerQuestion = async (req, res) => {
  const { testId, questionId } = req.params;
  const { answer } = req.body;

  const test = await Test.findById(testId);
  if (!test) return res.status(404).send("Test not found");
  if (test.completed) {
    return res.send({
      message: "Test is already completed",
      accessed: test.accessed,
      score: test.score
    });
  }
  const question = await Question.findById(questionId).select("-correctAnswer");
  if (!question) return res.status(404).send("Question not found");

  const isCorrect = answer === question.correctAnswer;
  test.score += isCorrect ? question.difficulty : 0;

  const nextDifficulty = isCorrect
    ? question.difficulty + 1
    : question.difficulty - 1;
  const nextQuestion = await Question.findOne({
    difficulty: nextDifficulty
  }).select("-correctAnswer");

  test.questions.push({ questionId, answer });

  const correctStreak = test.questions
    .slice(-3)
    .every((q) => q.answer === "correct");
  const endCondition =
    test.questions.length >= test.totalQuestions ||
    (question.difficulty === 1 && !isCorrect) ||
    correctStreak;

  if (endCondition) {
    test.completed = true;
    test.accessed = true;
    await test.save();
    return res.send({
      message: "Test completed",
      accessed: test.accessed,
      score: test.score
    });
  }

  await test.save();
  res.send({
    testId,
    nextQuestion,
    score: test.score
  });
};
*/

exports.startTest = async (req, res) => {
  try {
    // Our seeded questions use difficulty mapping (easy -> 3, medium -> 6, hard -> 9)
    // so start at an "easy" level that we know exists.
    const initialDifficulty = parseInt(process.env.INITIAL_DIFFICULTY, 10) || 3;

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

    const totalQuestionsEnv = parseInt(process.env.TEST_TOTAL_QUESTIONS, 10) || 10;

    const test = new Test({
      user: req.user._id,
      score: 0,
      totalQuestions: totalQuestionsEnv,
      questions: [{ questionId: initialQuestion._id }],
      startTime: Date.now(),
      uniqueURL: uniqueURL
    });

    await test.save();

    return sendJsonResponse(res, 201, true, "Test started successfully", {
      testId: test._id,
      uniqueURL: uniqueURL,
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

//get questions
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

    const nextDifficulty =
      lastQuestionData.correctAnswer === lastQuestion.answer
        ? lastQuestionData.difficulty + 1
        : lastQuestionData.difficulty - 1;

    const usedIds = test.questions.map((q) => q.questionId);
    // First, try to get a question at the calculated difficulty
    let nextQuestion = await Question.findOne({
      difficulty: nextDifficulty,
      _id: { $nin: usedIds }
    }).select("-correctAnswer");

    // Fallback: if none available at that difficulty, pick any unused question
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

// /submit answer
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
    test.score += isCorrect ? question.difficulty : 0;

    // Update existing question entry in this test instead of pushing duplicates
    const existingEntry = test.questions.find(
      (q) => String(q.questionId) === String(questionId)
    );
    if (existingEntry) {
      existingEntry.answer = answer;
    } else {
      test.questions.push({ questionId, answer });
    }

    const correctStreak = test.questions
      .slice(-3)
      .every((q) => q.answer === "correct");

    if (
      test.questions.length >= test.totalQuestions ||
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

    // In success case, also return the current score (frontend can fetch next question)
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
//get test details for admin -- by testId
exports.getTestById = async (req, res) => {
  const { testId } = req.params;
  try {
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
    console.error(error);
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

// get test detail for user - by unique url
exports.getTestDetails = async (req, res) => {
  const { uniqueURL } = req.params;
  console.log("Fetching test with unique URL: loggedankit", uniqueURL);
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
};
