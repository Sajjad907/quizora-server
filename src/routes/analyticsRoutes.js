const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getFunnelData,
  getLeads,
  getOutcomeDistribution,
  getQuizPerformance
} = require("../controllers/analyticsController");

// TODO: Add 'protect' middleware here once Auth is fully enforced
router.get("/stats", getOverviewStats);
router.get("/funnel", getFunnelData);
router.get("/leads", getLeads);
router.get("/outcomes", getOutcomeDistribution);
router.get("/quiz-performance", getQuizPerformance);

module.exports = router;
