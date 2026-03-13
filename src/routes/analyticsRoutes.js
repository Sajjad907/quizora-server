const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getFunnelData,
  getLeads,
  getOutcomeDistribution,
  getQuizPerformance,
  getMerchantStatsByShop
} = require("../controllers/analyticsController");

const { protect } = require("../middlewares/authMiddleware");

// Public-ish analytics for Shopify app
router.get("/shopify-stats", getMerchantStatsByShop);

// All other analytics routes require authentication
router.use(protect);

router.get("/stats", getOverviewStats);
router.get("/funnel", getFunnelData);
router.get("/leads", getLeads);
router.get("/outcomes", getOutcomeDistribution);
router.get("/quiz-performance", getQuizPerformance);

module.exports = router;
