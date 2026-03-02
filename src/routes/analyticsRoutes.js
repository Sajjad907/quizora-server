const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getFunnelData,
  getLeads,
  getOutcomeDistribution,
  getQuizPerformance
} = require("../controllers/analyticsController");

const { protect } = require("../middlewares/authMiddleware");

// All analytics routes require authentication
router.use(protect);

router.get("/stats", getOverviewStats);
router.get("/funnel", getFunnelData);
router.get("/leads", getLeads);
router.get("/outcomes", getOutcomeDistribution);
router.get("/quiz-performance", getQuizPerformance);

module.exports = router;
