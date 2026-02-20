const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    storeId: { type: String, required: true }, // Important for multi-tenancy
    
    status: { 
      type: String, 
      enum: ["started", "in_progress", "completed", "converted"], 
      default: "started" 
    },

    // Detailed User Responses (FR7)
    answers: [{
      questionId: { type: String },
      questionText: { type: String }, // Snapshot for reporting ease
      optionId: { type: String },
      value: { type: String } // Used for text inputs
    }],

    // Results
    outcomeId: { type: String },
    outcomeData: { type: Object }, // Store the calculated result snapshot
    score: { type: Number },
    matchedTags: [{ type: String }],

    // Tech Specs
    device: { type: String }, // "mobile", "desktop"
    browser: { type: String },
    ipAddress: { type: String }, // (Use with caution for GDPR)
    utmParameters: { // Marketing attribution
      source: { type: String },
      medium: { type: String },
      campaign: { type: String }
    },

    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
