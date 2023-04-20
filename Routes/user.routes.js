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
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

//Relation
router.patch('/follow/:id', userController.follow);

//Updating
router.put('/update-password/:id',userController.updatePassword);
router.put('/profilepicture/:id',userController.changeProfilePicture);
router.put('/address/:id',userController.changeAddress);
router.put('/job/:id',userController.changeJob);
router.put('/project/:id',userController.changeProject);
router.put('/philosophy/:id',userController.changePhilosophy);

module.exports = router;