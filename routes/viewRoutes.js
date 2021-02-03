const express = require('express');
const viewControllers = require('../controllers/viewControllers');

const router = express.Router();

//This is th main page of the website, that gives all the tours as a display
router.get('/', viewControllers.getOverview);
router.get('/tour/:tourNameSimplified', viewControllers.getTourDetailed);

module.exports = router;
