const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refreshtoken", authController.refreshToken);
router.post("/blacklist", authController.addBlacklist);
router.patch("/verifyCode", authController.verifyCode);

module.exports = router;
