const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Log in a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email not found" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // hour
      })
      .status(200)
      .json({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
};

// Log out a user
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during logout" });
  }
};
