const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/isUser-auth');
//const auth = require('../middleware/jwtAuthAdmin');
const router = express.Router();


//route to get user dashboard
router.get('/dashboard', isAuth, userController.getDashboard);






module.exports = router;

