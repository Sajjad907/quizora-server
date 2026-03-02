const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { protect } = require("../middlewares/authMiddleware");

// --- PUBLIC WIDGET ROUTES ---
router.post("/submit", quizController.submitQuiz);
router.get("/widget/:id", quizController.getQuizConfig); // Public: widget fetches quiz by ID or handle

// --- PROTECTED ADMIN ROUTES ---
// Apply protection to all routes below this line
router.use(protect);

router.get("/", quizController.getAllQuizzes);
router.post("/", quizController.createQuiz);
router.get("/:id", quizController.getQuizById);
router.patch("/:id", quizController.updateQuiz);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;
