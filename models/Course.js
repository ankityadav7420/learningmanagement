const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    durationHours: {
      type: Number,
      default: 5
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    published: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ title: 1, category: 1 });

module.exports = mongoose.model("Course", courseSchema);

