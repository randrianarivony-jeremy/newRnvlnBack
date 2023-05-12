const router = require('express').Router();
const userController = require('../Controllers/user.controller');

//user display: 'block'
router.get('/user/:id', userController.userInfo);
router.get('/:id', userController.currentUser);
router.delete('/:id', userController.deleteUser);

//Relation
router.get("/friends/:id", userController.fetchFriends);
// router.get("/followings/:id", userController.fetchFollowings);
router.get("/subscribers/:id", userController.fetchSubscribers);
router.get("/subscriptions/:id", userController.fetchSubscriptions);
router.patch('/subscribe/:id', userController.subscribe);
router.patch('/unsubscribe/:id', userController.unsubscribe);
router.patch('/friend_invitation', userController.inviteToBeFriends);
router.patch('/accept_friend', userController.acceptToBeFriends);

//Updating
router.put('/username/:id', userController.updateUsername);
router.put('/email/:id', userController.updateEmail);
router.put('/password/:id',userController.updatePassword);
router.put('/subscription/:id',userController.enableSubscription);
router.put('/fees/:id',userController.updateFees);
router.put('/profilepicture/:id',userController.changeProfilePicture);
router.put('/address/:id',userController.changeAddress);
router.put('/job/:id',userController.changeJob);
router.put('/project/:id',userController.changeProject);
router.put('/philosophy/:id',userController.changePhilosophy);

module.exports = router;