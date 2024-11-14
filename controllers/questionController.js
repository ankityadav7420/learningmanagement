const Question = require("../models/Question");

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { text, difficulty } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res
        .status(400)
        .json({ error: "Text is required and must be a non-empty string." });
    }
    if (typeof difficulty !== "number") {
      return res
        .status(400)
        .json({ error: "Difficulty is required and must be a number." });
    }

    const question = new Question({ text, difficulty });
    await question.save();
    res.status(201).json({ message: "New question added", question });
  } catch (error) {
    console.error("Error creating question:", error.message);
    res.status(500).json({ error: "Server error. Could not create question." });
  }
};

// Get a question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.id;

    if (!questionId) {
      return res.status(400).json({ error: "Invalid question ID format." });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.status(200).json({
      message: "Question retrieved successfully",
      question
    });
  } catch (error) {
    console.error("Error retrieving question:", error.message);
    res
      .status(500)
      .json({ error: "Server error. Could not retrieve question." });
  }
};

// get all question
exports.getQuestions = async (req, res) => {
  const questions = await Question.find({});
  res.json(questions);
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
      return res.status(404).send("Question not found");
    }

    res.send({
      message: "Question updated successfully",
      question: updatedQuestion
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the question");
  }
};

// Delete a question by ID (admin only)
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).send("Question not found");
    }

    res.send({
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting the question");
  }
};
