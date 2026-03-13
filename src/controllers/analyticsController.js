const asyncHandler = require("../utils/asyncHandler");
const Quiz = require("../models/Quiz");
const Session = require("../models/session");
const Lead = require("../models/Lead");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper: Build a quizId filter from query params
const getQuizFilter = (req) => {
  const filter = { ownerId: req.user.id };
  if (req.query.quizId && mongoose.Types.ObjectId.isValid(req.query.quizId)) {
    filter.quizId = new mongoose.Types.ObjectId(req.query.quizId);
  }
  return filter;
};

// @desc    Get Overview Statistics (Views, Starts, Completions, Conversion)
// @route   GET /api/analytics/stats?quizId=optional
// @access  Admin
exports.getOverviewStats = asyncHandler(async (req, res) => {
  const filter = getQuizFilter(req);
  const totalQuizzes = await Quiz.countDocuments({ ownerId: req.user.id });
  const totalStarts = await Session.countDocuments(filter);
  const totalCompletions = await Session.countDocuments({ ...filter, status: 'completed' });
  const totalLeads = await Lead.countDocuments(filter);
  const conversionRate = totalStarts > 0
    ? ((totalCompletions / totalStarts) * 100).toFixed(1)
    : 0;

  res.json({
    totalQuizzes,
    totalStarts,
    totalCompletions,
    totalLeads,
    conversionRate: parseFloat(conversionRate)
  });
});

// @desc    Get Conversion Funnel Data
// @route   GET /api/analytics/funnel?quizId=optional
// @access  Admin
exports.getFunnelData = asyncHandler(async (req, res) => {
  const filter = getQuizFilter(req);
  const started = await Session.countDocuments(filter);
  const completed = await Session.countDocuments({ ...filter, status: 'completed' });
  const leads = await Lead.countDocuments(filter);

  const funnelData = [
    { name: 'Quiz Views', value: started },
    { name: 'Started', value: started },
    { name: 'Completed', value: completed },
    { name: 'Leads Captured', value: leads }
  ];

  res.json(funnelData);
});

// @desc    Get Leads List
// @route   GET /api/analytics/leads?quizId=optional&page=1&limit=10
// @access  Admin
exports.getLeads = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  
  let filter = getQuizFilter(req);
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter = {
      ...filter,
      $or: [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    };
  }

  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('quizId', 'title');

  const total = await Lead.countDocuments(filter);

  res.json({  
    leads,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get Outcome Distribution
// @route   GET /api/analytics/outcomes?quizId=optional
// @access  Admin
exports.getOutcomeDistribution = asyncHandler(async (req, res) => {
  const filter = getQuizFilter(req);
  const matchStage = {
    status: 'completed',
    "outcomeData.title": { $exists
      : true },
    ...filter
  };

  const distribution = await Session.aggregate([
    { $match: matchStage },
    { $group: { _id: "$outcomeData.title", count: { $sum: 1 } } },
    { $project: { name: "$_id", value: "$count", _id: 0 } },
    { $sort: { value: -1 } }
  ]);

  res.json(distribution);
});

// @desc    Get per-quiz performance (for dashboard top quizzes)
// @route   GET /api/analytics/quiz-performance
// @access  Admin
exports.getQuizPerformance = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ ownerId: req.user.id }).select('title status').lean();
  
  const performance = await Promise.all(
    quizzes.map(async (quiz) => {
      const sessions = await Session.countDocuments({ quizId: quiz._id });
      const completions = await Session.countDocuments({ quizId: quiz._id, status: 'completed' });
      const leads = await Lead.countDocuments({ quizId: quiz._id });
      const conversionRate = sessions > 0 ? Math.round((completions / sessions) * 100) : 0;

      return {
        _id: quiz._id,
        title: quiz.title,
        status: quiz.status,
        sessions,
        completions,
        leads,
        conversionRate
      };
    })
  );

  // Sort by sessions desc
  performance.sort((a, b) => b.sessions - a.sessions);
  res.json(performance);
});

// @desc    Get stats by Shopify shop domain
// @route   GET /api/analytics/shopify-stats?shop=domain
// @access  Internal/Shopify
exports.getMerchantStatsByShop = asyncHandler(async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ status: "fail", message: "Shop domain is required" });

  const user = await User.findOne({ shopifyShop: shop }).lean();
  if (!user) return res.status(404).json({ status: "fail", message: "Merchant not found" });

  const ownerId = user._id;
  const totalQuizzes = await Quiz.countDocuments({ ownerId });
  const totalStarts = await Session.countDocuments({ ownerId });
  const totalCompletions = await Session.countDocuments({ ownerId, status: 'completed' });
  const totalLeads = await Lead.countDocuments({ ownerId });
  const conversionRate = totalStarts > 0
    ? ((totalCompletions / totalStarts) * 100).toFixed(1)
    : 0;

  // Also get recent quizzes
  const recentQuizzes = await Quiz.find({ ownerId })
    .sort({ updatedAt: -1 })
    .limit(3)
    .select('title status handle updatedAt')
    .lean();

  res.json({
    totalQuizzes,
    totalStarts,
    totalCompletions,
    totalLeads,
    conversionRate: parseFloat(conversionRate),
    plan: user.plan,
    status: user.subscriptionStatus,
    recentQuizzes
  });
});
