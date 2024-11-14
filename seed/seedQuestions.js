const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const mongoURI = process.env.DB_URI_LOCAL || "mongodb://localhost:27017/lms";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  difficulty: { type: Number, min: 1, max: 10, required: true },
  correctAnswer: { type: String, required: true }
});

const Question = mongoose.model("Question", questionSchema);

const generateRandomQuestion = () => {
  const difficulty = Math.floor(Math.random() * 10) + 1;
  return {
    text: faker.lorem.sentence(),
    difficulty: difficulty,
    correctAnswer: faker.lorem.word()
  };
};

const seedQuestions = async () => {
  try {
    const questions = Array.from({ length: 500 }, generateRandomQuestion);

    await Question.insertMany(questions);
    console.log("500 random questions inserted into the database");
  } catch (error) {
    console.error("Error seeding questions:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
