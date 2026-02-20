const Session = require("../models/session");

/**
 * Start a new quiz session
 */
exports.startSession = async (req, res, next) => {
  try {
    const { quizId, storeId, device, browser, utmParameters } = req.body;

    const session = await Session.create({
      quizId,
      storeId,
      device,
      browser,
      utmParameters,
      status: "started"
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * Update session as progress is made
 */
exports.updateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answers, status } = req.body;

    const session = await Session.findByIdAndUpdate(sessionId, {
      answers,
      status: status || "in_progress"
    }, { new: true });

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.json(session);
  } catch (error) {
    next(error);
  }
};
