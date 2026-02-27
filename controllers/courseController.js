const Course = require("../models/Course");
const Test = require("../models/Test");
const { sendJsonResponse } = require("../utils/responseHandler");

// Get all published courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
    return sendJsonResponse(
      res,
      200,
      true,
      "Courses retrieved successfully",
      courses
    );
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Course retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.published) {
      return sendJsonResponse(res, 404, false, "Course not found.");
    }
    return sendJsonResponse(res, 200, true, "Course retrieved successfully", course);
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Course retrieval failed due to a server error.",
      null,
      error
    );
  }
};

// Simple personalized profile: user info + recent tests
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    const tests = await Test.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const profile = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      stats: {
        totalTests: await Test.countDocuments({ user: user._id }),
        completedTests: await Test.countDocuments({
          user: user._id,
          completed: true
        })
      },
      recentTests: tests,
    };

    return sendJsonResponse(res, 200, true, "Profile retrieved successfully", profile);
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Profile retrieval failed due to a server error.",
      null,
      error
    );
  }
};

