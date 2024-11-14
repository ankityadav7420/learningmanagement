const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const mongoURI = process.env.DB_URI_LOCAL || "mongodb://localhost:27017/lms";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const setupAdmin = async () => {
  try {
    const admin = await User.findOne({ email: "admin@example.com" });

    if (admin) {
      console.log("Admin user already exists.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("adminPassword123", salt);

    const newAdmin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error: Admin user already exists with the same email.");
    } else {
      console.error("Error setting up admin user:", error);
    }
  } finally {
    mongoose.connection.close();
  }
};

setupAdmin();
