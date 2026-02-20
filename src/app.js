const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const quizRoutes = require("./routes/quizRoutes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

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
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost origin in development
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
