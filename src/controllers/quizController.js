const asyncHandler = require("../utils/asyncHandler");
const Quiz = require("../models/Quiz");
const Session = require("../models/session"); // Note: filename lowercase 'session.js' in your directory
const Lead = require("../models/Lead");
const scoringService = require("../services/scoringService");

// --- PUBLIC WIDGET API ---

// @desc    Get Quiz configuration (Public)
// @route   GET /api/widget/quiz/:id_or_handle
// @access  Public
exports.getQuizConfig = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  
  // Try finding by ID first, then Handle
  let quiz;
  if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    quiz = await Quiz.findById(identifier).lean();
  }

  // Fallback to Handle if not found by ID OR not an ID format
  if (!quiz) {
    quiz = await Quiz.findOne({ handle: identifier, status: 'published' }).lean();
    
    // Fallback for development (if using draft)
    if (!quiz && process.env.NODE_ENV === 'development') {
      quiz = await Quiz.findOne({ handle: identifier }).lean();
    }
  }

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found or not published");
  }

  // Ensure each question has a consistent 'id' field (not just _id)
  const questionsWithIds = quiz.questions.map(q => ({
    ...q,
    id: q.id || q._id.toString() // Use custom id if exists, else use MongoDB _id
  }));

  res.json({
    id: quiz._id,
    title: quiz.title,
    theme: quiz.theme,
    startScreen: quiz.startScreen,
    questions: questionsWithIds,
    settings: quiz.settings
  });
});

// @desc    Start Quiz Session (for Funnel Tracking)
// @route   POST /api/widget/quiz/:id/start
// @access  Public
exports.startQuizSession = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const { utmParameters } = req.body;

  // Resolve Quiz (ID or Handle)
  let quiz;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    quiz = await Quiz.findById(identifier).lean();
  }
  
  // Fallback to Handle if not found by ID OR not an ID format
  if (!quiz) {
    quiz = await Quiz.findOne({ handle: identifier, status: 'published' }).lean();
  }

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Create Initial Session
  const session = await Session.create({
    quizId: quiz._id,
    storeId: quiz.storeId || "default-store",
    status: 'started',
    utmParameters: utmParameters || {},
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.status(201).json({ sessionId: session._id });
});

// @desc    Submit Quiz & Get Result
// @route   POST /api/widget/quiz/:id/submit
// @access  Public
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { answers, sessionId, quizId: bodyQuizId } = req.body;
  // Support both field names: widget sends 'contactInfo', legacy uses 'customerInfo'
  const customerInfo = req.body.customerInfo || req.body.contactInfo;
  // Support both /api/widget/quiz/:id/submit (URL param) and /api/quizzes/submit (body quizId)
  const identifier = req.params.id || bodyQuizId;

  if (!identifier) {
    res.status(400);
    throw new Error("Quiz ID is required");
  }

  // Try finding by ID first, then Handle (Smart Resolution)
  let quiz;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    quiz = await Quiz.findById(identifier).lean();
  } 
  
  // Fallback to Handle if not found by ID OR not an ID format
  if (!quiz) {
    quiz = await Quiz.findOne({ handle: identifier }).lean();
  }

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // 1. Calculate Outcome
  const result = scoringService.calculateOutcome(quiz, answers || []);
  let session;

  // 2. Update Existing Session or Create New
  if (sessionId) {
    session = await Session.findById(sessionId);
    if (session) {
      session.status = 'completed';
      session.answers = answers.map(a => ({
        questionId: a.questionId,
        optionId: a.optionId,
        value: a.value
      }));
      session.outcomeId = result.outcomeId;
      session.outcomeData = { title: result.outcome?.title };
      session.score = result.scores?.[result.outcomeId] || 0;
      session.completedAt = Date.now();
      
      await session.save();
    }
  }

  // Fallback: Create new if no session ID provided (Legacy support)
  if (!session) {
    session = await Session.create({
      quizId: quiz._id,
      storeId: quiz.storeId || "default-store",
      status: 'completed',
      answers: answers.map(a => ({
        questionId: a.questionId,
        optionId: a.optionId,
        value: a.value
      })),
      outcomeId: result.outcomeId,
      outcomeData: { title: result.outcome?.title }, 
      score: result.scores?.[result.outcomeId] || 0,
      completedAt: Date.now(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });
  }

  // 3. Capture Lead if Email provided (FR6)
  if (customerInfo && customerInfo.email) {
    await Lead.create({
      storeId: quiz.storeId || "default-store",
      quizId: quiz._id,
      sessionId: session._id,
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      marketingConsent: customerInfo.marketingConsent || false,
      finalOutcomeTitle: result.outcome?.title // Track what they matched
    });
  }

  // 4. Return Result
  res.status(201).json({
    sessionId: session._id,
    outcome: result.outcome,
    products: result.aggregatedProducts, 
    scoreDetails: result.scores,
    winReason: result.winReason,
    scoringDebug: result.debugLog
  });
});

// --- ADMIN API (Protected) ---

exports.createQuiz = asyncHandler(async (req, res) => {
  const { title, handle, questions, outcomes, theme, settings } = req.body;
  
  if (!title || !handle) {
    res.status(400); 
    throw new Error("Title and Handle are required");
  }

  const existingQuiz = await Quiz.findOne({ handle });
  if (existingQuiz) {
    res.status(400);
    throw new Error("Quiz URL handle already exists. Please choose a unique one.");
  }

  const quiz = await Quiz.create({
    storeId: "default-store",
    title,
    handle,
    questions: questions || [],
    outcomes: outcomes || [],
    theme: theme || {},
    settings: settings || {}
  });

  res.status(201).json(quiz);
});

exports.getAllQuizzes = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const total = await Quiz.countDocuments({});
  const quizzes = await Quiz.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({
    quizzes,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

exports.getQuizById = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  let quiz;
  
  // Try by ObjectId first, then by handle
  if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
    quiz = await Quiz.findById(identifier);
  }
  
  // Fallback: try by handle
  if (!quiz) {
    quiz = await Quiz.findOne({ handle: identifier });
  }

  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

exports.updateQuiz = asyncHandler(async (req, res) => {
  const updatedQuiz = await Quiz.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  );
  if (!updatedQuiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  res.json(updatedQuiz);
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
   const quiz = await Quiz.findById(req.params.id);
   if(quiz) {
      await quiz.deleteOne();
      res.json({ message: "Quiz removed" });
   } else {
      res.status(404);
      throw new Error("Quiz not found");
   }
});

// @desc    Get Admin Dashboard Stats
exports.getStats = asyncHandler(async (req, res) => {
  const totalQuizzes = await Quiz.countDocuments({});
  const totalLeads = await Lead.countDocuments({});
  const totalSessions = await Session.countDocuments({});
  
  const completedSessions = await Session.countDocuments({ status: 'completed' });
  const conversionRate = totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0;

  res.json({
    totalQuizzes,
    totalLeads,
    totalSessions,
    conversionRate: `${conversionRate}%`,
    trends: {
      quizzes: "+1 this week",
      leads: "+12% total",
      sessions: "+5% organic",
      conversion: "2.1% growth"
    }
  });
});
