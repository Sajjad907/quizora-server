const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/shopify-login", authController.shopifyLogin);
router.post("/sync-user", authController.syncUser);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", protect, authController.me);
router.get("/status", authController.checkStatus);
router.get("/profile", protect, authController.getProfile);
router.patch("/profile", protect, authController.updateProfile);

module.exports = router;
