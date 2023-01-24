const express = require('express');
const fileUpload = require("express-fileupload");
const session = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require('connect-flash');
const mongoose = require("mongoose");

const { User }= require('../db/models/User');

const errorController = require('../controllers/error');

const postRoutes = require('../routes/post');
const adminRoutes = require('../routes/admin');
const shopRoutes = require('../routes/shop');
const authRoutes = require('../routes/auth');
const userRouter = require('../routes/user');


module.exports = function(app) {
   
    // linking the session with db.
    const mongoStore = connectMongo(session);

    // initialize express-session to allow us track the logged-in user across sessions.
    app.use(session({ 
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 600000 },
        store: new mongoStore({mongooseConnection: mongoose.connection, collection:'sessions'})
    }));

    app.use(connectFlash());

    // middleware function to check for logged-in users
    app.use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.isAuthorised = req.session.isAdmin;
       
        next();
    });

    app.use((req, res, next) => {
        if(!req.session.user) {
            console.log('notworking')
            return next();
        }
        let tet = req.session.user._id;
        User.findById(tet)
            .then(user => {
                if (!user) {
                    return next();
                }
                req.user = user;
                console.log(tet + 'kkkk')
                next();
            })
            .catch(err => {
                next(new Error(err));
            });
    });
    
    app.use(fileUpload({
        createParentPath: true,
        //tempFileDir : '/tmp/'
    }));

    //.use(fileUpload());

    app.use(postRoutes);
    app.use('/admin', adminRoutes);
    app.use(shopRoutes);
    app.use(authRoutes);
    app.use('/user', userRouter);

    //  app.get('/500', errorController.get500);
    
    // //handing invalid url(404)
    // app.use((req, res, next) => {
    //     res.render('page404');
    // });

    // //middleware handling 500 errors
    // app.use((error, req, res, next) => {
    //     res.redirect('/500');
    // })

}