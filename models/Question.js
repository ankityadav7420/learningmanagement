const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      minlength: [5, "Question text should be at least 5 characters long"]
    },
    difficulty: {
      type: Number,
      min: [1, "Difficulty must be at least 1"],
      max: [10, "Difficulty can be at most 10"],
      required: [true, "Difficulty level is required"],
      index: true
    },
    // For single / input questions we still use this string.
    // For multi-select, you can store a comma-separated list or extend later to an array.
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      minlength: [1, "Correct answer must not be empty"]
    },
    // All answer options shown to the user (for choice-based questions).
    // For input-based questions this can stay empty.
    options: {
      type: [String],
      default: []
    },
    // Controls how UI should render and how answers are evaluated.
    // - single  -> radio buttons, one correct
    // - multiple -> checkboxes, multiple correct (future extension)
    // - input   -> free-text input
    answerType: {
      type: String,
      enum: ["single", "multiple", "input"],
      default: "single",
      index: true
    },
    tag: {
      type: String,
      enum: [
        "GK",
        "GS",
        "Reasoning",
        "EnglishGrammar",
        "Science",
        "HighLevelMath",
        "Mix"
      ],
      required: [true, "Tag is required for better categorization"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Optional: ensure uniqueness of text + difficulty to reduce duplicates at scale
questionSchema.index({ text: 1, difficulty: 1 }, { unique: false });

module.exports = mongoose.model("Question", questionSchema);
