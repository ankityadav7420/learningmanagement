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

mongoose
  .connect(dbConfig.url)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const app = express();
app.use(cors());

dotenv.config({ path: "config/config.env" });
mongoose
  .connect(dbConfig.url)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    "Access-Control-Allow-Origin": "*",
    optionsSuccessStatus: 200
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
