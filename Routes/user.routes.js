const router = require('express').Router();
const authController = require('../Controllers/auth.controller');
const userController = require('../Controllers/user.controller');

//auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

//user display: 'block'
router.get('/', userController.getAllUsers);
router.get('/:id', userController.userInfo);
router.put('/tag/:id', userController.uploadTag);
router.put('/new-edp/:id',userController.uploadEdp);
router.post('/philosophy/:id',userController.uploadPhilosophy);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

//Updating
router.put('/update-password/:id',userController.updatePassword);

module.exports = router;