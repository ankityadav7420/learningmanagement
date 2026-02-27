const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question"
        },
        answer: String
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false,
      index: true
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
      default: Date.now,
      index: true
    },
    uniqueURL: {
      type: String,
      unique: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate questions inside a single test at the schema level
testSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 1) {
    const ids = this.questions.map((q) => String(q.questionId));
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      return next(
        new Error("A test cannot contain the same question more than once.")
      );
    }
  }
  next();
});

module.exports = mongoose.model("Test", testSchema);
