const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
//const auth = require('../middleware/jwtAuthAdmin');
const router = express.Router();


//route for admin dashboard
router.get('/dashboard', isAuth, adminController.getAdminDashboard );
//route to get all posts
router.get('/allPosts', isAuth, adminController.getAllPosts);
//route to get add post link
router.get('/addPost', isAuth, adminController.getAddPost);
//route for adding post
router.post('/addPost', isAuth, adminController.postAddPost);
//route for editing post
router.get('/post/edit/:id', isAuth, adminController.getEditPost);
//route for updating post
router.post('/post/update/:id', isAuth, adminController.postUpdatePost);
//route for deleting post
router.get('/post/delete/:id', isAuth, adminController.DeletePost);
//route to get add product
router.get('/add-product', isAuth, adminController.getAddProduct);
//route to post add product
router.post('/add-product', isAuth, adminController.postAddProduct);


module.exports = router;

