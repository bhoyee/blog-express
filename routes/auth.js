const express = require('express');
const { check, body } = require('express-validator');
const { User }= require('../db/models/User');

const router = express.Router();
const isAuth = require('../middleware/is-auth');
const authController = require('../controllers/auth');


router.get('/auth/register', authController.getAdminSignup);
router.get('/auth/signup', authController.getUserSignup);

router.get('/auth/admin', authController.getAdminLogin);
router.get('/auth/login', authController.getUserLogin);

router.post('/auth/admin', authController.postLogin);
router.post('/auth/register', authController.postSignup);

router.post('/auth/login', [
  check('email').isEmail()
        .withMessage('Please enter valid email')
        .custom( async (value, { req }) => {
             // check if user exist with email
            let user = await User.findOne({email: req.body.email});
            if ( !user ) return Promise.reject(
                'No User found with this email .'
              );
          })
        .normalizeEmail(),

], authController.postUserLogin);
router.post('/auth/signup', 
    [  //validate user input
      body('username')
        .isLength({ min: 5 })
        .trim()
        .withMessage('Minimum of 5 Characters for Username'),

      check('email').isEmail()
        .withMessage('Please enter valid email')
        .custom( async (value, { req }) => {
            //check if user exit with username
            let uname  = await User.findOne({ username: req.body.username.toLowerCase() });
            if ( uname ) return Promise.reject(
                'Username exists already, please pick a different one.'
              );
    
            // check if user exist with email
            let email = await User.findOne({email: req.body.email});
            if ( email ) return Promise.reject(
                'E-Mail exists already, please pick a different one.'
              );
          })
        .normalizeEmail(),

      body('password')
            .isLength({ min: 5 })
            .custom((value, { req }) => {
                if(!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z][a-z A-Z0-9\\_\\"]{8,}$/, "i")){
                    throw new Error('Password must contain number, text( both upper & lower case ) and special characters with minimum value of 5.'); 
                }
                return true;
            })
        .trim(),
      body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
            })
    ], 
       authController.postUserSignup
);

router.get('/auth/logout', authController.postLogout);

router.get('/auth/reset', authController.getReset);
router.post('/auth/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/auth/new-password', authController.postNewPassword);


module.exports = router;