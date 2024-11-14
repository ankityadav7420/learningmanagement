## LMS Backend API

This backend API serves as the core for the Learning Management System (LMS) with adaptive testing. It includes features like user authentication, adaptive testing, and role-based access control for admins and general users. The backend is built using Node.js, Express, and MongoDB.

# Installation

1. Clone the repository

```bash
        git clone <repository-url>
        cd <repository-directory>
        npm install

```

2. Configure Environment Variables

Create a .env file in the config folder with the following variables:

```bash
        JWT_SECRET=
        DB_URI_LOCAL=
        PORT=4000
```

    •   JWT_SECRET: Secret key for JWT signing.
    •	DB_URI_LOCAL: MongoDB connection string (for local MongoDB instance).
    •	PORT: Server port (default is 4000).

4. To populate the database with initial question data, run the seeder file:

```bash
   node seed/seedQuestions.js
```

# Admin Setup

```bash
  node seed/setupAdmin.js
```

5.Start the Server

```bash
        npm start
```

The server should now be running at http://localhost:4000.

# How to Test the Backend

Follow these steps to test the backend functionality:

1.  Clone the Repo and Run the Server
    Follow the installation instructions above, then start the server.
2.  Sign Up and Log In
    Use the /auth/register and /auth/login endpoints to create an account and obtain an authentication token.
3.  Start a Test
4.  Send a POST request to http://localhost:4000/api/tests/start to start a new test. You will receive a test ID and the first question in the response.
5.  Submit Answers
    For each question, submit your answer using the Submit Answer: api/tests/testID/questions/questionID/answer endpoint:

        • Send a POST request with the testID and questionID in the body.
        • The response will contain a new question (up to 5 questions).
        • Repeat until the test ends. 5. View Test Details
        • Admin: Use the unique admin endpoint to view complete details of all tests.
        • General User: View test details for your own test using the test ID.

Other API Endpoints

Additional endpoints may be available based on your specific requirements. You can test them as per the usual REST conventions.

# API Documentation

Base URL

The base URL for all endpoints is:

http://localhost:4000/api

# Collections

        Postman Collections API: [text](https://www.postman.com/ayadav7/workspace/learning-management-service/collection/23284222-a573ba7b-0d13-44ec-aec3-aae1cb789da4?action=share&creator=23284222)

Authentication Endpoints

    •	Register: POST /auth/register
    •	Login: POST /auth/login

These endpoints handle user registration and login. Tokens are returned upon successful login and are required for accessing protected routes.

Test Endpoints

    •	Start Test: POST /tests/start

1.  Start a new adaptive test session. Returns the first question and a test ID.
    • Submit Answer: POST /tests/submit

        * After receiving a question and test ID from the start test endpoint, submit your answer to receive the next question. Continue this process until the test ends. A maximum of 5 questions are included in each test session (modifiable in configuration).

        • Body Parameters:
        • testID: The ID of the ongoing test.
        • questionID: The ID of the question being answered.
        • answer: The user’s answer to the question.

# Admin Access

Admins have access to additional endpoints to view complete details of all tests:
• View All Tests: GET /admin/tests (unique URL for each test)
• View Specific Test: GET /admin/tests/:testID

# General User Access

General users can view only their own test details by test ID if logged in:
• View Own Test: GET /tests/:testID
