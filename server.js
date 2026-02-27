const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testRoutes = require("./routes/testRoutes");
const dbConfig = require("./config/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
app.use(
  cors({
    origin: ["https://lms-frontend-self.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    "Access-Control-Allow-Origin": "*",
    optionsSuccessStatus: 200
  })
);
dotenv.config({ path: ".env" });
mongoose
  .connect(process.env.DB_URI_LOCAL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

//DB_URI_LOCAL=mongodb+srv://lmsankit:vgYmmBriMkl7jn6j@cluster0.lvxvs8m.mongodb.net/lms?retryWrites=true&w=majority
