const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      validate: {
        validator: function (v) {
          return v.length >= 3;
        },
        message: "Name should be at least 3 characters long"
      }
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: "Please enter a valid email"
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (v) {
          return v && v.length >= 6;
        },
        message: "Password should be at least 6 characters long"
      }
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: [true, "Role is required"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
