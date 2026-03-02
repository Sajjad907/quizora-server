const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: String, required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    sessionId: { type: String, required: true }, // Link to the quiz session
    
    // Customer Info (FR6)
    email: { type: String, required: true, index: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    
    // Metadata
    marketingConsent: { type: Boolean, default: false },
    source: { type: String, default: "widget" }, // e.g. "popup", "embedded"
    geoLocation: { type: String }, // "US", "PK" etc.
    
    // Shopify Sync Status
    syncedToShopify: { type: Boolean, default: false },
    shopifyCustomerId: { type: String },

    // Outcome Snapshot
    finalOutcomeTitle: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
