//THIS IS THE ROUTES PAGE OF THE USERS

//Core Modules
const express = require('express');

//File Modules
const userController = require('./../controllers/userControllers');

const router = express.Router();

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
