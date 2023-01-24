const express = require('express');
const { Post } = require('../db/models/Post');
const _ = require('lodash');


const ITEMS_PER_PAGE = 10; // Numb of post to display per page

exports.getindex = async(req, res, next) => {
    try {
        let isAuthenticated = req.session.isLoggedIn;
        let isAuthorised = req.session.isAdmin;
        let cart = req.session.cart;
       
      
        const page = +req.query.page  || 1; // pagination query
        let totalItems;

            const numPosts = await Post.find().countDocuments() //fetch total num of posts
            totalItems = numPosts;
       
        const posts = await Post.find() // fetch all posts 
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort('-createdAt')
     

        res.render('index', { 
            posts,
            cart,
            isAuthenticated, 
            isAuthorised,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
         });  
      
       
    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
    }
};

exports.getPostDetail = async (req, res, next) => {
    try {
        let isAuthenticated = req.session.isLoggedIn;
        let isAuthorised = req.session.isAdmin;
        let cart = req.session.cart;
        // lodash to turn requestTitle to lowercase
        const requestTitle = _.lowerCase(req.params.postName);
                    
        const post = await Post.findById(req.params.id) // fetch data from db using id

        //converting post title to lowercase using lodash
        const pTitle = _.lowerCase(post.title);
                 
        if ( pTitle === requestTitle && req.params.id.match(/^[0-9a-fA-F]{24}$/) ) {
           res.render('post', { post, 
            isAuthenticated, 
            isAuthorised,
            cart
         });  
        } else {
           
            res.render('page404');
        }
        
        /*
        check if id is valid ObjectId
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            const post = await Post.findById(req.params.id, req.params.postName);
             res.render('post', { post, isAuthenticated, isAuthorised });  
              } else {
             res.render('page404');
            }
        */
       
    }
    catch(err) {
        console.log('Something go wrong.. error: ' + err)
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

