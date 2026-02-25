const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();

// Health Check (Top level to bypass other middlewares for testing)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is initializing",
    time: new Date().toISOString()
  });
});

const quizRoutes = require("./routes/quizRoutes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

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
  origin: true, // Allow all origins in production/development for now to prevent deployment blocks
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.json({ status: "API is working", env: process.env.NODE_ENV });
});

// Routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));

// SPA Fallback: All non-API routes serve index.html
app.get("(.*)", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
