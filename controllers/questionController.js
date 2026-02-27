const Question = require("../models/Question");
const { sendJsonResponse } = require("../utils/responseHandler");

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { text, difficulty } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return sendJsonResponse(
        res,
        400,
        false,
        "Question creation failed: text is required and must be a non-empty string."
      );
    }
    if (typeof difficulty !== "number") {
      return sendJsonResponse(
        res,
        400,
        false,
        "Question creation failed: difficulty is required and must be a number."
      );
    }

    const question = new Question({ text, difficulty });
    await question.save();
    return sendJsonResponse(res, 201, true, "New question added", question);
  } catch (error) {
    console.error("Error creating question:", error.message);
    return sendJsonResponse(
      res,
      500,
      false,
      "Question creation failed due to a server error.",
      null,
      error
    );
  }
};

// Get a question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.id;

    if (!questionId) {
      return sendJsonResponse(
        res,
        400,
        false,
        "Question retrieval failed: invalid question ID."
      );
    }

    const question = await Question.findById(questionId).select(
      "-correctAnswer"
    );

    if (!question) {
      return sendJsonResponse(res, 404, false, "Question not found.");
    }

    return sendJsonResponse(
      res,
      200,
      true,
      "Question retrieved successfully",
      question
    );
  } catch (error) {
    console.error("Error retrieving question:", error.message);
    return sendJsonResponse(
      res,
      500,
      false,
      "Question retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// get all question
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    return sendJsonResponse(
      res,
      200,
      true,
      "Questions retrieved successfully",
      questions
    );
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Questions retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// Update a question by ID (admin only)
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { text, difficulty, correctAnswer } = req.body;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { text, difficulty, correctAnswer },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Question update failed: question not found."
      );
    }

    return sendJsonResponse(
      res,
      200,
      true,
      "Question updated successfully",
      updatedQuestion
    );
  } catch (error) {
    console.error(error);
    return sendJsonResponse(
      res,
      500,
      false,
      "Question update failed due to a server error.",
      null,
      error
    );
  }
};

// Delete a question by ID (admin only)
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return sendJsonResponse(
        res,
        404,
        false,
        "Question deletion failed: question not found."
      );
    }

    return sendJsonResponse(
      res,
      200,
      true,
      "Question deleted successfully"
    );
  } catch (error) {
    console.error(error);
    return sendJsonResponse(
      res,
      500,
      false,
      "Question deletion failed due to a server error.",
      null,
      error
    );
  }
};
