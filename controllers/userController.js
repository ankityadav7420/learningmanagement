const User = require("../models/User");
const { sendJsonResponse } = require("../utils/responseHandler");

// Get current authenticated user details
exports.getMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendJsonResponse(res, 404, false, "User not found.");
    }
    return sendJsonResponse(res, 200, true, "User retrieved successfully", user);
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "User retrieval failed due to a server error.",
      null,
      error
    );
  }
};

