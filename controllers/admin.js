
const { Post }= require('../db/models/Post');
const  { Product } = require('../db/models/Product');
const path = require('path');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 10; // Numb of post to display per page
const POSTS_PER_PAGE = 20;

//controller to get Admin Dashboard
exports.getAdminDashboard = async (req, res, next ) => {
    try {
        let userName = req.session.user.username; //session to get login Username
        const page = +req.query.page  || 1; // pagination query
        let totalItems;
        try{
            const numPosts = await Post.find().countDocuments() //fetch total num of posts
            totalItems = numPosts;
        }
        catch(err){
            console.log(err);
        }


         const posts = await Post.find()
         .skip((page - 1) * ITEMS_PER_PAGE)
         .limit(ITEMS_PER_PAGE)
         .sort('-createdAt')
         res.render('admin/dashboard', { 
            posts,
            userName,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            
            
            });
         const token = req.session.authToken;
         console.log('dahboard token :' + token);
    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
  
};
//get allPosts
exports.getAllPosts = async (req, res, next) => {
    try {
        let userName = req.session.user.username; //session to get login Username

        const page = +req.query.page  || 1; // pagination query
        let totalItems;

        try{
            const numPosts = await Post.find().countDocuments() //fetch total num of posts
            totalItems = numPosts;
        }
        catch(err){
            console.log(err);
        }


         const posts = await Post.find()
         .skip((page - 1) * POSTS_PER_PAGE)
         .limit(POSTS_PER_PAGE)
         .sort('-createdAt')
         res.render('admin/allPosts', { 
            posts,
            userName,
            currentPage: page,
            hasNextPage: POSTS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / POSTS_PER_PAGE)
            
            
            });
         const token = req.session.authToken;
         console.log('dahboard token :' + token);
    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}
 //controller to get Add Post link
exports.getAddPost = async (req, res, next) => {
    try {
        let userName = req.session.user.username; //session to get login Username

        res.render('admin/addPost', { userName, errors: req.flash('loginErrors') });
    }
    catch(err) {
        console.log('Somthing go wrong ... error: ' + err);
        res.redirect('/500');
    }
}

// controller to Add Post
exports.postAddPost = async(req, res, next) => {
    try{ 
        let author = req.session.user.username; 
        //get current date
        let date = new Date();
            date = date.toISOString().replace(':','-')
                       .replace(':','-').replace('.','-');
        let image;
        //check if file is selected 
        if(!req.files) {
            console.log('No kfile uploaded');
            req.flash('loginErrors', 'No file uploaded');
            return res.redirect('/admin/addPost');
        }
        else {
           image = req.files.image;
        }
        //check for file type
        if(image.mimetype === 'image/png' || image.mimetype === 'image/jpeg' || 
           image.mimetype === 'image/jpg' || image.mimetype === 'image/gif') {
            
            //creating unique filename
           let fileName = (date + '-' + image.name);
                      
           image.mv(path.resolve(__dirname, '..', 'public/posts',  fileName), async (err) => {
        
               try{
                    let post = new Post ({
                        title: req.body.title,
                        description: req.body.description,
                        content: req.body.content,
                        //author: name,
                        author: author.username,
                        image: `./public/posts/${fileName}` 
                                                
                        })
                        await post.save();
                        res.redirect('/admin/allPosts');
                }
                catch(err) {
                        console.log(err);
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                }
                   
                
             })
        }
        else {
            console.log('file not supported');
            req.flash('loginErrors', 'File uploaded not supported');
            return res.redirect('/admin/addPost');
            //return res.send('file not supported')       
        }

    }
    catch(err) {

        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    
};

//controller for edit post
exports.getEditPost = async (req, res, next) => {
    try {
        let userName = req.session.user.username; //session to get login Username

        //check if id is valid ObjectId
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.render('page404');
    
        const post = await Post.findById(req.params.id);

        res.render('admin/editPost', { post, userName, viewTitle: "Edit / Update Post" });

    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
 //controller for updating post
exports.postUpdatePost = async (req, res, next) => {

    try{
        let name = req.session.user.username;
         
        const posts =  await Post.findByIdAndUpdate(req.params.id, {
          title: req.body.title,
          description: req.body.description,
          content: req.body.content,
         
          author: name,
          createdAt: req.body.createdAt
        },
        {new: true});
      if(!posts) return res.send('somthing is wrong with posting');
    
      res.redirect('/admin/dashboard');
    
       }
       catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
//controller to Delete post
exports.DeletePost = async (req, res , next) => {
    try{
        const post =  await Post.findByIdAndRemove(req.params.id);
        fileHelper.deleteFile(post.image);
        if(!post) return res.send('Post not found ');
        res.redirect('/admin/dashboard');
    }
    catch(err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

//get add product link
exports.getAddProduct = (req, res, next) => {
    let userName = req.session.user.username; //session to get login Username
    res.render('admin/addProduct', {
        userName,
        errors: req.flash('Errors'),
        successMsg: req.flash('success')
    });

}
// post add product
exports.postAddProduct = ( req, res, next ) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description
    try{ 
        let author = req.session.user.username; 
        //get current date
        let date = new Date();
            date = date.toISOString().replace(':','-')
                       .replace(':','-').replace('.','-');
        let image;
        //check if file is selected 
        if(!req.files) {
            console.log('No file uploaded');
            req.flash('Errors', 'No file uploaded');
            return res.redirect('/admin/add-Product');
        }
        else {
           image = req.files.image;
        }
        //check for file type
        if(image.mimetype === 'image/png' || image.mimetype === 'image/jpeg' || 
           image.mimetype === 'image/jpg' || image.mimetype === 'image/gif') {
            
            //creating unique filename
           let fileName = (date + '-' + image.name);
                      
           image.mv(path.resolve(__dirname, '..', 'public/posts/shop',  fileName), async (err) => {
        
               try{
                    let product = new Product ({
                        title: title,
                        price: price,
                        description: description,
                        author: author.username,
                        image: `./public/posts/shop/${fileName}`,
                        userId: req.user
                                                
                        })
                        await product.save();
                         //on success
                        req.flash("success", "Product Addeed Succefully");
                        res.redirect('/admin/add-Product');
                       
                }
                catch(err) {
                        console.log(err);
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                }
                   
                
             })
        }
        else {
            console.log('file not supported');
            req.flash('Errors', 'File uploaded not supported');
            return res.redirect('/admin/add-Product');
            //return res.send('file not supported')       
        }

    }
    catch(err) {

        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    
}