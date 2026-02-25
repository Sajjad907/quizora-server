const asyncHandler = require("../utils/asyncHandler");
const Quiz = require("../models/Quiz");
const Session = require("../models/session");
const Lead = require("../models/Lead");
const mongoose = require("mongoose");

// Helper: Build a quizId filter from query params
const getQuizFilter = (req) => {
  if (req.query.quizId && mongoose.Types.ObjectId.isValid(req.query.quizId)) {
    return { quizId: new mongoose.Types.ObjectId(req.query.quizId) };
  }
  return {};
};

// @desc    Get Overview Statistics (Views, Starts, Completions, Conversion)
// @route   GET /api/analytics/stats?quizId=optional
// @access  Admin
exports.getOverviewStats = asyncHandler(async (req, res) => {
  const filter = getQuizFilter(req);
  const totalQuizzes = await Quiz.countDocuments({});
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
    "outcomeData.title": { $exists: true },
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
  const quizzes = await Quiz.find({}).select('title status').lean();
  
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
