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

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.verify, userController.updateMe);
router.delete('/deleteMe', authController.verify, userController.deleteMe);

router.patch(
  '/updateMyPassword',
  authController.verify,
  authController.updateMyPassword
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
