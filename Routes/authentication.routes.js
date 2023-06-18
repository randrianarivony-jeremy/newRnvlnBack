const router = require('express').Router();
const authController = require('../Controllers/auth.controller');
const loginLimiter = require("../middleware/loginLimiter");

//auth
router.post("/register", authController.signUp);
router.post("/login", loginLimiter, authController.signIn);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refreshToken);

module.exports = router;