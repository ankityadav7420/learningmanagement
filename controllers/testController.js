const crypto = require("crypto");
const Test = require("../models/Test");
const Question = require("../models/Question");

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
      totalQuestions: 10, // Specify the total number of questions
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
  } catch (error) {
    res.status(500).send("Server error during test initiation");
  }
};

//get questions
exports.getQuestion = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).send("Test not found");

    const lastQuestion = test.questions[test.questions.length - 1];
    const lastQuestionData = await Question.findById(lastQuestion.questionId);

    const nextDifficulty =
      lastQuestionData.correctAnswer === lastQuestion.answer
        ? lastQuestionData.difficulty + 1
        : lastQuestionData.difficulty - 1;

    const nextQuestion = await Question.findOne({
      difficulty: nextDifficulty
    }).select("-correctAnswer");

    res.send({ question: nextQuestion, score: test.score });
  } catch (error) {
    res.status(500).send("Server error while fetching question");
  }
};

// /submit answer
exports.answerQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, answer } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).send("Test not found");

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).send("Question not found");

    const isCorrect = answer === question.correctAnswer;
    test.score += isCorrect ? question.difficulty : 0;
    test.questions.push({ questionId, answer });

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
      return res.send({ message: "Test completed", score: test.score });
    }

    await test.save();
    res.redirect(`/${testId}/questions`); // Redirect to fetch next question
  } catch (error) {
    res.status(500).send("Server error while submitting answer");
  }
};
//get test details for admin -- by testId
exports.getTestById = async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await Test.findById(testId).populate("questions.questionId");
    if (!test) {
      return res.status(404).send("Test not found");
    }

    res.send(test);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving the test details");
  }
};

// get test detail for user - by unique url
exports.getTestDetails = async (req, res) => {
  const { uniqueURL } = req.params;
  const test = await Test.findOne({ uniqueURL }).populate(
    "questions.questionId"
  );
  if (!test) return res.status(404).send("Test not found");

  res.send(test);
};
