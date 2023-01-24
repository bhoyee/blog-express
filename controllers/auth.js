const express = require('express');
const { User }= require('../db/models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const  { Product } = require('../db/models/Product');

 // configure using sendgrid
 const transporter = nodemailer.createTransport(sendgridTransport({
    auth : {
        api_key: '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'
    }
 }));

 //  configuring  SMTP Server details using gmail.
 /*
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: 'ajxchangers@gmail.com',
        pass: 'Binsalith_01'
    }

});
*/

//controller to get admin login link
exports.getAdminLogin = (req, res, next) => {
    
    res.render('admin/adminLogin', { isAuthenticated: false, isAuthorised: false,
        errors: req.flash('loginErrors')
    });
};

//controller to get User login link
exports.getUserLogin = (req, res, next) => {
   
    res.render('user/userLogin', { isAuthenticated: false,
        errors: req.flash('loginErrors')
    });
};

 //controller to get Admin singup link
exports.getAdminSignup = (req, res, next) => {
    
    res.render('admin/register', {
        isAuthenticated : false, errors: req.flash('registrationErrors')
    });
};

//controller to get user register link
exports.getUserSignup = (req, res, next) => {
   
    res.render('user/signup', {
        isAuthenticated: false, errors: req.flash('errors'),
        successMsg: req.flash('success'), err:'',
        oldInput: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          },
        validationErrors: []
    });
};

//Admin registration
exports.postSignup = async (req, res, next) => {
    try{
        // check if user exist with email
        let user = await User.findOne({ email: req.body.email });
        if(user) return req.flash('registrationErrors', 
                'User already exit with this email!'), res.redirect('/auth/register');
          
        //create new user
        user = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: 'admin'
            });
            //encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        
            await user.save();
            res.redirect('/auth/admin');
           
    }
    catch(error) {
        const registrationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('registrationErrors', registrationErrors)
        return res.redirect( '/auth/register')
    }
};

//handling admin login
exports.postLogin = async (req, res, next) => {

    try {
        //check if user exist 
        const user = await User.findOne({ $and : [{ email: req.body.email },{ role: 'admin'} ]});
        if(!user) return req.flash('loginErrors', 
          'Invalid Username or Password.'), res.redirect('/auth/admin');

        //compare and decrypt password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
         if(!validPassword) return req.flash('loginErrors', 
         'Invalid Username or Password'), res.redirect('/auth/admin');

         //creating web token 
         const token = await user.generateAuthToken();
        //create session 
         req.session.isLoggedIn = true;
         req.session.isAdmin = true;
         req.session.user = user;
        // req.session.name = user;
         req.session.authToken = token;  //store token in session
         req.session.save(err => {
         console.log(err);

         res.redirect('/admin/dashboard');
         });
         
    
    }
    catch(error) {

       const loginErrors = Object.keys(error.errors).map(key => error.errors[key].message)
 
        req.flash('loginErrors', loginErrors)
        return res.redirect('/auth/admin');
    }
};
 // User signUp
exports.postUserSignup = async (req, res, next) => {
    try{
        // validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('user/signup', {
                isAuthenticated: false, 
                err: errors.array()[0].msg,
                successMsg: '',
                errors:'',
                oldInput: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    confirmPassword: req.body.confirmPassword    
                  },
                validationErrors: errors.array()
            });
        }

         //create new user
        user = new User({
                username: req.body.username.toLowerCase(),
                email: req.body.email,
                password: req.body.password,
                role: 'user'
            });
            //encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        
            await user.save(); 
            //on success
            req.flash("success", "Successful registered. Kindly verify your email from your Inbox");
                      
            try {

                res.redirect('/auth/signup');
                
                //sending mail content 
               await transporter.sendMail({
                    to: req.body.email,
                    from: 'support@rahcase.com',
                    subject: 'Signup Succeeded!',
                    html: '<h1>You successful signed up to BhoyeeBlog!</h1>'  
                  });           
            }
            catch(err) {
                console.log(err + ' Email not sending')
            }   
    }
    catch(error) {
        //on failure
        console.log(error);
        req.flash('errors', error);
        return res.redirect( '/auth/signup')
    }
};
// user login
exports.postUserLogin = async (req, res, next) => {
    try {
        let cart = 0;

        //check if user exist 
        const user = await User.findOne({ $and : [{ email: req.body.email },{ role: 'user'} ]});
        if(!user) return req.flash('loginErrors', 
          'Invalid Username or Password'), res.redirect('/auth/login');

        //compare and decrypt password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
         if(!validPassword) return req.flash('loginErrors', 
         'Invalid Username or Password'), res.redirect('/auth/login');

         //calling generated auth web token
         const token = await user.generateAuthToken();
          
         // checking user cart 
         const products = user.cart.items;
            products.forEach(p => {
               cart += p.quantity; //add total quantity to cart
            })

          req.session.cart = cart; // create cart session 
        
          //create session 
          req.session.isLoggedIn = true;
          req.session.isAdmin = false;
          req.session.user = user;
         // req.session.name = user;
          req.session.authToken = token;  //store token in session
         
        req.session.save(err => {
        console.log(err);
        res.redirect('/');
        });
            
    }
    catch(error) {
        const loginErrors = Object.keys(error.errors).map(key => error.errors[key].message)
        req.flash('loginErrors', loginErrors)
        
        return res.redirect('/auth/login');
    }
};
// handling user logout
exports.postLogout = (req, res, next) => {
    
    req.session.destroy(err => {
    console.log(err);
    res.redirect('/')
    });
};

// get reset password page
exports.getReset = (req, res, next) => {
    res.render('user/reset', {
        isAuthenticated: false, errors: req.flash('errors'),
        successMsg: req.flash('success')
    });
};

// Set Reset password
exports.postReset = (req, res, next) => {
    try {   //create random value using crypto
            crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                console.log (err); 
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex'); // generating token from buffer
            //check for user
            let user = await User.findOne({ $and : [{ email: req.body.email },{ role: 'user'} ]});
            if(!user) {
                req.flash('errors', 'No account with that email found.');
                return res.redirect('/auth/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            user.save();

            //on success
            req.flash("success", "New Password reset instruction send to your Inbox");
                
            res.redirect('/auth/reset');
            //send confirmation via email
            transporter.sendMail({
                to: req.body.email,
                from: 'support@rahcase.com',
                subject: 'Password Rest!',
                html: `
                <p>You request a password reset</p>
                <p>Click this <a href="http://localhost:4000/reset/${token}"link </a> to set a new password.</p>
                
                `  
            });
        });
    }
    
    catch(err) {
        console.log(err);
    }
};
//get New Password page
exports.getNewPassword = async (req, res, next) => {
    try {
         //check user for token
        const token = req.params.token;
        const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
        if(user) {      
            res.render('user/new-password', {
            isAuthenticated: false, errors: req.flash('errors'),
            successMsg: req.flash('success'),
            userId: user._id.toString(),
            passwordToken: token
          });
       
        }
        else {
            res.render('expiredlink', { viewTitle: "Link Expired" });   
        }   
        
    }
    catch(err){
        console.log(err);
    } 
};

//post New Password
exports.postNewPassword = async (req, res, next) => {
    try {
         
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;
        let resetUser;
  
        const user = await User.findOne({
            resetToken: passwordToken, 
            resetTokenExpiration: { $gt: Date.now() }, 
            _id: userId
        });

        if(user) {
            resetUser = user;
           let pwd = await bcrypt.hash( newPassword, 12 );    //Hash password
           
           resetUser.password = pwd;
           resetUser.resetToken = undefined;
           resetUser.resetTokenExpiration = undefined;
               
           resetUser.save(); 
           res.redirect('/auth/login');
            //send confirmation via email
            transporter.sendMail({
                to: resetUser.email,
                from: 'support@rahcase.com',
                subject: 'Password Change!',
                html: `
                <p>Your Password Change Successfully</p>
                <p>Click this <a href="http://localhost:4000/auth/login"link </a> to login to your account.</p>
                
                `  
            });
           

         }         
    }
    catch(err) {
        console.log(err);
    }
};

