const express = require('express');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require('connect-flash');
const mongoose = require("mongoose");



const posts = require('../routes/post');
const login = require('../routes/login');
const admin = require('../routes/admin');
const logout = require('../routes/logout');
const newpost = require('../routes/newpost');
const updatePost = require('../routes/updatePost');
const deletePost = require('../routes/deletePost');
const register = require('../routes/register');





module.exports = function(app) {

    
app.use(connectFlash());

const mongoStore = connectMongo(expressSession);
app.use(expressSession({ 
    secret: 'keyboard cat',
    //  resave: false,
    //  saveUninitialized: true,
    cookie: { maxAge: 60000 },
    store: new mongoStore({mongooseConnection: mongoose.connection})
}));


app.use(fileUpload());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/', posts);
app.use('/auth/login', login);
app.use('/auth/register', register);
app.use('/auth/admin', admin);
app.use('/auth/newpost', newpost);
app.use('/auth/logout', logout);
app.use('/:id', posts);
app.use('/posts/update/', updatePost);
app.use('/posts/delete/', deletePost);








}