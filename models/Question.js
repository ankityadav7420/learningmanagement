const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    minlength: [5, "Question text should be at least 5 characters long"]
  },
  difficulty: {
    type: Number,
    min: [1, "Difficulty must be at least 1"],
    max: [10, "Difficulty can be at most 10"],
    required: [true, "Difficulty level is required"]
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"],
    minlength: [1, "Correct answer must not be empty"]
  }
});

module.exports = mongoose.model("Question", questionSchema);
