const mongoose = require("mongoose");

// --- SUB-SCHEMAS (Modular Structure) ---

// 1. Theme Configuration (Visual Customization)
const themeSchema = new mongoose.Schema({
  // Colors
  primaryColor: { type: String, default: "#6366f1" },
  backgroundColor: { type: String, default: "#0a0a0b" },
  textColor: { type: String, default: "#ffffff" },
  secondaryColor: { type: String, default: "#1e293b" },
  accentColor: { type: String, default: "#8b5cf6" },
  
  // Typography
  fontFamily: { type: String, default: "Inter" },
  
  // Styles
  borderRadius: { type: String, enum: ["sharp", "rounded", "pill"], default: "rounded" },
  buttonStyle: { type: String, enum: ["solid", "outline", "ghost"], default: "solid" },
  shadowIntensity: { type: String, enum: ["soft", "medium", "hard", "none"], default: "medium" },
  animationStyle: { type: String, enum: ["spring", "smooth", "bounce", "linear", "none"], default: "spring" },
  progressStyle: { type: String, enum: ["bar", "percentage", "minimal", "none"], default: "bar" },
  layoutMode: { type: String, enum: ["classic", "split-hero", "minimalist", "glass-morph"], default: "classic" },
  
  // Legacy (for backward compatibility)
  customCss: { type: String, default: "" },
  layout: { type: String, enum: ["popup", "embedded", "full-page"], default: "popup" }
});

// 2. Start Screen (Landing Page of Quiz)
const startScreenSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  title: { type: String, default: "Find Your Perfect Match" },
  description: { type: String, default: "Take this quick quiz to get personalized recommendations." },
  buttonText: { type: String, default: "Start Quiz" },
  imageUrl: { type: String }, // S3/CDN URL
  videoUrl: { type: String }
});

// 3. Option/Answer Schema
const optionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique ID relative to question
  text: { type: String, required: true },
  imageUrl: { type: String },
  
  // Simplified // Logic & Scoring
  tags: [{ type: String }], // For Affinity Matching ("Oily Skin", "Budget")
  nextQuestionId: { type: String }, // For branching (optional)
  weights: [{
    outcomeId: { type: String },
    points: { type: Number, default: 1 }
  }],
  recommendedProducts: [{
    productId: { type: String },
    handle: { type: String },
    title: { type: String },
    imageUrl: { type: String },
    price: { type: String },
    reason: { type: String }
  }]
});

// 4. Question Schema (FR3)
const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["single_choice", "multiple_choice", "short_text", "long_text", "email", "info", "checkboxes"], 
    default: "single_choice" 
  },
  text: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  required: { type: Boolean, default: true },
  options: [optionSchema], // Array of options
  
  // Settings per question
  allowMultiple: { type: Boolean, default: false },
  backgroundColor: { type: String } // Per question override
});

// 5. Outcome/Recommendation (Result)
const outcomeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  externalLink: { type: String }, // For custom links
  
  // Tag-Based Matching
  tags: [{ type: String }], // Tags to match against selected option tags
  priority: { type: Number, default: 0 }, // Higher priority wins in case of tie (0-100)
  minScore: { type: Number, default: 0 }, // Minimum score required to qualify for this outcome
  discountCode: { type: String }, // Optional coupon code for this outcome
  
  // Shopify Product References
  recommendedProducts: [{
    productId: { type: String },   // Shopify internal ID
    handle: { type: String },      // Product slug
    title: { type: String },
    imageUrl: { type: String },
    price: { type: String },
    reason: { type: String }       // Why this product was recommended
  }],
  
  // Optional Strict Matching
  matchingRules: {
    requiredTags: [{ type: String }] // Must have ALL these tags to qualify
  }
});

// --- MAIN QUIZ SCHEMA ---
const quizSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: String, required: true, index: true }, // Creates link to Shopify Shop
    title: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    
    // Configurations
    theme: themeSchema,
    startScreen: startScreenSchema,
    
    // Content
    questions: [questionSchema],
    outcomes: [outcomeSchema],

    // Global Settings
    settings: {
      collectEmail: { type: Boolean, default: true }, // Lead Capture
      showProgressBar: { type: Boolean, default: true },
      resultLayout: { type: String, enum: ["simple", "detailed_products"], default: "detailed_products" },
      
      // Widget Display Settings
      defaultLayout: { type: String, enum: ["modal", "fullscreen", "inline"], default: "modal" },
      defaultAnimation: { type: String, enum: ["scale-up", "fade-in", "slide-up"], default: "scale-up" }
    },
    
    // Branding Settings
    branding: {
      removeWatermark: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
