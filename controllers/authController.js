const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/responseHandler");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendJsonResponse(res, 400, false, "User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return sendJsonResponse(res, 201, true, "User registered successfully");
  } catch (error) {
    return sendJsonResponse(res, 500, false, "Registration failed due to a server error", null, error
    );
  }
};

// Log in a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendJsonResponse(res, 400, false, "Login failed: user not found");
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return sendJsonResponse( res, 400, false, "Login failed: invalid password"
      );
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        // Keep the JWT valid for 24 hours so login survives refreshes
        expiresIn: "24h"
      }
    );

    res
      // HTTP-only token cookie used by the backend for auth
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      })
      // Non-HTTP-only flag so the frontend can detect logged-in state on refresh
      .cookie("clientAuth", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      });

    return sendJsonResponse(res, 200, true, "User logged in successfully");
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Login failed due to a server error",
      null,
      error
    );
  }
};

// Log out a user
exports.logout = async (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
      })
      .clearCookie("clientAuth", {
        httpOnly: false,
        sameSite: "none",
        secure: process.env.NODE_ENV === "production"
      });

    return sendJsonResponse(res, 200, true, "User logged out successfully");
  } catch (error) {
    return sendJsonResponse(
      res,
      500,
      false,
      "Logout failed due to a server error",
      null,
      error
    );
  }
};
