const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.get("/", quizController.getAllQuizzes);
router.post("/", quizController.createQuiz);
router.post("/submit", quizController.submitQuiz);

// Admin route - returns full quiz document
router.get("/:id", quizController.getQuizById);
router.patch("/:id", quizController.updateQuiz);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;
