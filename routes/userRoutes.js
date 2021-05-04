//THIS IS THE ROUTES PAGE OF THE USERS

//Core Modules
const express = require('express');

//File Modules
const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authControllers');

const router = express.Router();

//these endpoints requires only one http request that is post
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// For any user cases
// where he must only pass thourgh the verify middleware
router.use(authController.verify);

router.patch(
  '/updateMe',
  userController.updateUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updateMyPassword);

// For admin cases
// where he must pass thorugh the verify middleware and the authorize middleware too
router.use(authController.authorize(['admin']));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:userId')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
