# Salon Booking API & Jest E2E Test Suite

A backend REST API for a salon booking system built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This repository includes a complete automated end-to-end (E2E) test suite built using **Jest** and **Supertest**.

---

## 📌 Prerequisites

Before running the server or tests locally, make sure you have the following installed:

- **Node.js**: v18.x or v22.x (`node -v`)
- **npm**: v9 or higher
- **MongoDB**: A running local MongoDB database (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string.

---

## 🛠️ Project Dependencies

### Backend Stack
- **Express**: Web framework for building REST endpoints.
- **Mongoose**: Schema management and MongoDB object modeling.
- **jsonwebtoken (JWT)**: Handles user authentication and access tokens.
- **bcryptjs**: Password hashing for secure user registration and login.
- **dotenv**: Loads environment variables from a `.env` file.
- **cors**: Middleware for handling cross-origin requests.

### Testing Tools
- **Jest**: Testing framework and runner.
- **Supertest**: Used to make HTTP requests against Express endpoints in tests.
- **ts-jest / tsx**: Enables running TypeScript code without manual build steps.
- **mongodb-memory-server**: Spins up an in-memory MongoDB server for fast, isolated test execution.

---

## ⚙️ Environment Setup

1. Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/salon-db
JWT_SECRET=my_super_secret_jwt_key
```

2. (Optional) For running tests against a dedicated database, create a `.env.test` file:

```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/salon-db-test
JWT_SECRET=test_secret_key
NODE_ENV=test
```

---

## 🚀 How to Run the App

### Start in development mode (with hot reloading):
```bash
npm run dev
```

### Build TypeScript code:
```bash
npm run build
```

### Run production server:
```bash
npm start
```

---

## 🧪 Running Automated Tests

You can execute the test suite using these npm commands:

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run tests in watch mode (auto re-runs when code changes):**
  ```bash
  npm run test:watch
  ```

- **Check code coverage:**
  ```bash
  npm run test:coverage
  ```

---

## 🏗️ Test Suite Architecture & Approach

### 1. Clean Database Setup & Teardown
- Tests run in an isolated test environment so local development data isn't affected.
- `beforeEach` and `afterAll` hooks automatically wipe collections between tests to keep test runs predictable and independent.

### 2. Complete E2E Flow Automated
The test suite validates the full user workflow end-to-end:
`Register User` ➡️ `Login & Get Token` ➡️ `Browse Salons` ➡️ `Create Booking` ➡️ `Cancel Booking`

### 3. Test Coverage
- **Positive Scenarios**:
  - Creating a new user account.
  - Logging in and receiving a valid JWT token.
  - Fetching available salons and services.
  - Booking an appointment successfully.
  - Canceling an active booking owned by the user.

- **Negative & Auth Scenarios**:
  - Duplicate registration attempts (returns 400 Bad Request).
  - Incorrect login credentials (returns 401 Unauthorized).
  - Calling protected routes without a `Bearer` token.
  - Attempting to cancel a booking owned by another user (returns 403 Forbidden).
  - Passing invalid or non-existent IDs (returns 404 Not Found).

### 4. Code Reusability
Shared helper functions in `tests/helpers/` take care of DB connections, token generation, and mock data creation, keeping the actual test files concise and readable.
