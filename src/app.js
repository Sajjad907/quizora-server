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

// Content Security Policy to allow Shopify embedding
app.use((req, res, next) => {
  const shop = req.query.shop;
  const frameAncestors = ["https://admin.shopify.com", "https://*.myshopify.com"];
  
  if (shop) {
    frameAncestors.push(`https://${shop}`);
  }

  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestors.join(" ")};`
  );
  next();
});

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://www.dermamage.com',
      'https://dermamage.com',
      'https://quizora-admin.vercel.app',
    ];
    // Allow: no origin (curl/postman), localhost, 127.0.0.1, *.vercel.app, dermamage.com
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('dermamage.com') ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Fallback: allow anyway (staging/preview URLs)
      callback(null, true);
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

// SPA Fallback for Widget Frontend (React Router)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
