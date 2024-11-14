const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      answer: String
    }
  ],
  score: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  accessed: {
    type: Boolean,
    default: false // Track if the test has been started
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  uniqueURL: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model("Test", testSchema);
