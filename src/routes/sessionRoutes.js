const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.post("/", sessionController.startSession);
router.patch("/:sessionId", sessionController.updateSession);

module.exports = router;
