const router = require('express').Router();
const authController = require('../Controllers/auth.controller');

//auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refreshToken);

module.exports = router;