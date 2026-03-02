const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const cookie_parser = require("cookie-parser");

const quizRoutes = require("./routes/quizRoutes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cookie_parser());

// Security middleware
// app.use(helmet());

// Rate limiter - Increased for development (Dashboard makes multiple concurrent API calls)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Increased from 100 to handle concurrent requests
  })
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins that end with .vercel.app or localhost
    if (!origin || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to true if unknown, for staging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV });
});

app.use("/api/quizzes", quizRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
