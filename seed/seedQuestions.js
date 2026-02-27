const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("../models/Question");

dotenv.config({ path: ".env" });

const mongoURI = process.env.DB_URI_LOCAL;

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB for question seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Map external API difficulties to our numeric scale (1–10)
const difficultyMap = {
  easy: 3,
  medium: 6,
  hard: 9
};

// Map external categories to our internal tags
const categoryToTag = (category) => {
  if (!category) return "Mix";
  const c = category.toLowerCase();
  if (c.includes("general")) return "GK";
  if (c.includes("science")) return "Science";
  if (c.includes("math")) return "HighLevelMath";
  if (c.includes("history") || c.includes("geography") || c.includes("politics"))
    return "GS";
  if (c.includes("english") || c.includes("language")) return "EnglishGrammar";
  if (c.includes("logic")) return "Reasoning";
  return "Mix";
};

// Decode HTML entities from Open Trivia DB (they return HTML-encoded text)
const decodeHtml = (html) => {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

// Simple in-place shuffle for options
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Fetch up to 50 questions per call from Open Trivia DB
const fetchQuestionsFromApi = async (amount = 50, token = null) => {
  const params = new URLSearchParams({
    amount: String(amount),
    type: "multiple"
  });
  if (token) params.set("token", token);

  const url = `https://opentdb.com/api.php?${params.toString()}`;

  // Simple retry with backoff for HTTP 429 (rate limit)
  const maxRetries = 5;
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    const res = await fetch(url);
    if (res.status === 429) {
      // Too many requests – wait longer and retry
      const delay = 2000 * (attempt + 1);
      console.warn(
        `Received 429 from Open Trivia DB, retrying in ${delay}ms (attempt ${
          attempt + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
      lastError = new Error("Open Trivia DB rate limited (429)");
      continue;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch from Open Trivia DB: ${res.status}`);
    }

    const data = await res.json();
    if (data.response_code === 5) {
      throw new Error("Open Trivia DB rate limit exceeded");
    }
    return data;
  }

  throw lastError || new Error("Failed to fetch from Open Trivia DB after retries");
};

// Optionally use a token to avoid duplicates across calls
const createSessionToken = async () => {
  const res = await fetch("https://opentdb.com/api_token.php?command=request");
  if (!res.ok) return null;
  const data = await res.json();
  return data.token || null;
};

const BATCH_SIZE = 50; // API max per call
const TOTAL_QUESTIONS = 300; // keep moderate to respect rate limits

const seedQuestions = async () => {
  let inserted = 0;
  let token = null;
  try {
    console.log(
      `Seeding up to ${TOTAL_QUESTIONS} questions from Open Trivia DB in batches of ${BATCH_SIZE}...`
    );

    token = await createSessionToken();

    while (inserted < TOTAL_QUESTIONS) {
      const remaining = TOTAL_QUESTIONS - inserted;
      const batchSize = Math.min(BATCH_SIZE, remaining);

      const apiResponse = await fetchQuestionsFromApi(batchSize, token);
      if (apiResponse.response_code === 4) {
        // Token exhausted, request a new one
        token = await createSessionToken();
        continue;
      }

      const rawQuestions = apiResponse.results || [];
      if (!rawQuestions.length) {
        console.log("No more questions returned from API.");
        break;
      }

      const docs = rawQuestions.map((q) => {
        const difficulty =
          difficultyMap[q.difficulty] || Math.floor(Math.random() * 10) + 1;
        const tag = categoryToTag(q.category);
        const allOptions = shuffleArray(
          [q.correct_answer, ...(q.incorrect_answers || [])].map(decodeHtml)
        );
        return {
          text: decodeHtml(q.question),
          difficulty,
          correctAnswer: decodeHtml(q.correct_answer),
          options: allOptions,
          answerType: "single",
          tag
        };
      });

      await Question.insertMany(docs, { ordered: false });
      inserted += docs.length;
      console.log(`Inserted ${inserted}/${TOTAL_QUESTIONS} questions`);

      // Simple delay to be nice to the public API
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log("Question seeding from Open Trivia DB completed.");
  } catch (error) {
    console.error("Error seeding questions from Open Trivia DB:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
